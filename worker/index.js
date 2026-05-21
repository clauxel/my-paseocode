import { handleAnalyticsRequest } from './analytics.js'
import { handleNowPaymentsCheckout } from './nowpayments.js'

const LIVE_ORIGIN = 'https://paseocode.space'
const LIVE_HOST = 'paseocode.space'
const ALT_HOSTS = new Set(['www.paseocode.space'])
const ANNUAL_DISCOUNT_MULTIPLIER = 0.5

const creemProductCache = new Map()

const planCatalog = {
  solo: {
    id: 'solo',
    name: 'Solo',
    monthlyAmountCents: 2900,
    currency: 'USD',
    summary: 'one-mission Paseo Code pilot',
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    monthlyAmountCents: 9900,
    currency: 'USD',
    summary: 'default managed Paseo Code workspace',
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    monthlyAmountCents: 24900,
    currency: 'USD',
    summary: 'private runner and GitHub automation planning',
  },
}

const indexablePaths = [
  '/',
  '/paseo-code',
  '/paseo-sh',
  '/paseo-github',
  '/paseo-agent',
  '/getpaseo-paseo',
  '/paseo-codex',
  '/paseo-opencode',
  '/pricing',
  '/privacy',
  '/terms',
]

const staticAssetPaths = new Set([...indexablePaths, '/checkout/done'])

function securityHeaders(request) {
  const headers = new Headers({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  })

  const origin = request?.headers?.get?.('Origin')
  if (isAllowedCorsOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Vary', 'Origin')
  }

  return headers
}

function isAllowedCorsOrigin(origin) {
  if (!origin) return false

  try {
    const url = new URL(origin)
    if (url.hostname === LIVE_HOST || ALT_HOSTS.has(url.hostname)) return true
    if (url.hostname.endsWith('.pages.dev') || url.hostname.endsWith('.workers.dev')) return true
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true
  } catch {}

  return false
}

function jsonResponse(data, status = 200, request = null) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), { status, headers })
}

function handleOptions(request) {
  return new Response(null, { status: 204, headers: securityHeaders(request) })
}

function maybeRedirectToHttps(requestUrl) {
  if (requestUrl.hostname === LIVE_HOST || ALT_HOSTS.has(requestUrl.hostname)) {
    if (requestUrl.protocol !== 'https:' || requestUrl.hostname !== LIVE_HOST) {
      const redirectUrl = new URL(requestUrl)
      redirectUrl.protocol = 'https:'
      redirectUrl.hostname = LIVE_HOST
      return Response.redirect(redirectUrl.toString(), 301)
    }
  }
  return null
}

function resolvePublicAppOrigin(requestUrl) {
  if (requestUrl.hostname === LIVE_HOST || ALT_HOSTS.has(requestUrl.hostname)) {
    return `https://${requestUrl.hostname}`
  }

  if (requestUrl.hostname.endsWith('.pages.dev') || requestUrl.hostname.endsWith('.workers.dev')) {
    return requestUrl.origin
  }

  return LIVE_ORIGIN
}

function resolveCreemBase(env) {
  const raw = String(env?.CREEM_API_BASE ?? '').trim()
  return raw ? raw.replace(/\/+$/, '') : 'https://api.creem.io'
}

async function getSecretValue(value) {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value.get === 'function') {
    const resolved = await value.get()
    return typeof resolved === 'string' ? resolved.trim() : ''
  }
  return ''
}

async function firstSecretEnv(env, ...keys) {
  for (const key of keys) {
    const value = await getSecretValue(env?.[key])
    if (value) return value
  }
  return ''
}

function normalizeEnvKey(value) {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function formatMoney(amountCents, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100)
}

function resolveConfiguredProductId(env, planId, billing) {
  const cycle = billing === 'monthly' ? 'MONTHLY' : 'YEARLY'
  const tier = planId === 'scale' ? 'SCALE' : planId === 'solo' ? 'SOLO' : 'STUDIO'
  const normalizedSelection = normalizeEnvKey(`${planId}_${billing}`)
  const keys = [
    `CREEM_PRODUCT_${tier}_${cycle}`,
    `CREEM_PRODUCT_ID_PASEOCODE_${normalizedSelection}`,
    `CREEM_PRODUCT_ID_${normalizedSelection}`,
    `CREEM_PRODUCT_ID_${tier}`,
    'CREEM_PRODUCT_ID',
  ]

  for (const key of keys) {
    const value = env?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

async function requestCreemJson(apiKey, url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  const rawText = await response.text()
  let payload = null
  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === 'object'
        ? payload.message || payload.error || 'Creem request failed.'
        : 'Creem request failed.',
    )
  }

  return payload || {}
}

async function getOrCreateCreemProduct(env, apiKey, plan, billing, successUrl) {
  const configuredProductId = resolveConfiguredProductId(env, plan.id, billing)
  if (configuredProductId) return configuredProductId

  const cacheKey = `${plan.id}:${billing}`
  if (creemProductCache.has(cacheKey)) return creemProductCache.get(cacheKey)

  const monthlyAmountCents =
    billing === 'annual' ? Math.round(plan.monthlyAmountCents * ANNUAL_DISCOUNT_MULTIPLIER) : plan.monthlyAmountCents
  const totalAmountCents = billing === 'annual' ? monthlyAmountCents * 12 : monthlyAmountCents
  const billingLabel = billing === 'annual' ? 'annual' : 'monthly'

  const product = await requestCreemJson(apiKey, `${resolveCreemBase(env)}/v1/products`, {
    name: `Paseo Code ${plan.name} (${billingLabel})`,
    description: `${formatMoney(monthlyAmountCents, plan.currency)}/mo - ${plan.summary}`,
    price: totalAmountCents,
    currency: plan.currency,
    billing_type: 'onetime',
    tax_mode: 'inclusive',
    tax_category: 'saas',
    default_success_url: successUrl,
  })

  const productId = product.id || product.product_id
  if (!productId) throw new Error('Creem did not return a product id.')

  creemProductCache.set(cacheKey, productId)
  return productId
}

function extractCheckoutUrl(payload) {
  const candidates = [payload?.checkout_url, payload?.checkoutUrl, payload?.url]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  return ''
}

async function handleCheckout(request, env, requestUrl) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, request)
  }

  const apiKey = await firstSecretEnv(env, 'API_PROD_KEY', 'CREEM_API_KEY', 'CREEM_KEY')
  if (!apiKey) {
    return jsonResponse({ ok: false, error: 'Payment is not configured yet.' }, 503, request)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400, request)
  }

  const planId = typeof body?.planId === 'string' ? body.planId : 'studio'
  const billing = body?.billing === 'monthly' ? 'monthly' : 'annual'
  const plan = planCatalog[planId] || planCatalog.studio
  const successUrl = `${resolvePublicAppOrigin(requestUrl)}/checkout/done`

  try {
    const productId = await getOrCreateCreemProduct(env, apiKey, plan, billing, successUrl)
    const checkout = await requestCreemJson(apiKey, `${resolveCreemBase(env)}/v1/checkouts`, {
      product_id: productId,
      units: 1,
      success_url: successUrl,
      request_id: `paseocode_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      metadata: {
        site: 'paseocode.space',
        planId: plan.id,
        billing,
      },
    })
    const checkoutUrl = extractCheckoutUrl(checkout)
    if (!checkoutUrl) throw new Error('Creem did not return a checkout URL.')
    return jsonResponse({ ok: true, checkoutUrl }, 200, request)
  } catch {
    return jsonResponse({ ok: false, error: 'Secure checkout could not be created yet.' }, 502, request)
  }
}

function handleRuntime(request, requestUrl) {
  return jsonResponse(
    {
      ok: true,
      publicAppOrigin: resolvePublicAppOrigin(requestUrl),
      deployment: 'cloudflare-workers-assets',
      paymentProvider: 'creem',
      defaultPlan: 'studio',
      defaultBilling: 'annual',
      annualDiscount: '50%',
      ts: Date.now(),
    },
    200,
    request,
  )
}

async function handleAnalytics(request, env) {
  return handleAnalyticsRequest(request, env, { siteKey: 'paseocode' })
}

function buildSitemapXml() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = indexablePaths
    .map((path) => {
      const priority = path === '/' ? '1.0' : path === '/privacy' || path === '/terms' ? '0.4' : path === '/pricing' ? '0.9' : '0.78'
      const changefreq = path === '/' || path === '/pricing' ? 'weekly' : 'monthly'
      return `  <url>
    <loc>${LIVE_ORIGIN}${path === '/' ? '/' : path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

function handleSitemap(request) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', 'application/xml; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=3600')
  return new Response(buildSitemapXml(), { status: 200, headers })
}

function handleRobots(request) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', 'text/plain; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=3600')
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /checkout/done
Sitemap: ${LIVE_ORIGIN}/sitemap.xml
`
  return new Response(body, { status: 200, headers })
}

function noIndexNotFoundResponse(request) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Page not found</title></head><body><main><h1>Page not found</h1><p>This URL is not a public page for this product.</p></main></body></html>', { status: 404, headers })
}

async function fetchAsset(request, env) {
  if (env?.SITE_ASSETS?.fetch) {
    const requestUrl = new URL(request.url)
    const normalizedPath = requestUrl.pathname.replace(/\/+$/, '') || '/'

    if (staticAssetPaths.has(normalizedPath)) {
      const assetUrl = new URL(request.url)
      assetUrl.pathname = normalizedPath === '/' ? '/' : `${normalizedPath}/index.html`
      const assetResponse = await env.SITE_ASSETS.fetch(new Request(assetUrl.toString(), request))
      if (assetResponse.status !== 404) return assetResponse
    }

    return env.SITE_ASSETS.fetch(request)
  }

  return new Response('Cloudflare asset binding is unavailable.', {
    status: 500,
    headers: securityHeaders(request),
  })
}

export async function handleRequest(request, env) {
  const requestUrl = new URL(request.url)

  if (request.method === 'OPTIONS') return handleOptions(request)
  if (requestUrl.pathname === '/api/nowpayments-checkout') {
    return handleNowPaymentsCheckout(request, env, {
      plans: planCatalog,
      defaultPlanId: 'studio',
      siteName: 'paseocode',
      siteKey: 'paseocode',
      annualDiscountMultiplier: typeof ANNUAL_DISCOUNT_MULTIPLIER !== 'undefined'
        ? ANNUAL_DISCOUNT_MULTIPLIER
        : (typeof annualBillingMultiplier !== 'undefined' ? annualBillingMultiplier : 0.5),
    })
  }

  if (requestUrl.pathname === '/api/runtime') return handleRuntime(request, requestUrl)
  if (requestUrl.pathname === '/api/checkout') return handleCheckout(request, env, requestUrl)
  if (requestUrl.pathname === '/api/analytics/events') return handleAnalytics(request, env)

  const redirect = maybeRedirectToHttps(requestUrl)
  if (redirect) return redirect

  if (requestUrl.pathname === '/sitemap.xml') return handleSitemap(request)
  if (requestUrl.pathname === '/robots.txt') return handleRobots(request)

  return fetchAsset(request, env)
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env)
    } catch {
      return jsonResponse({ ok: false, error: 'Internal server error.' }, 500, request)
    }
  },
}
