import type { KeywordPage } from '../content/keyword-pages'
import type { RouteView } from './routing'

const liveOrigin = 'https://paseocode.space'
const siteName = 'Paseo Code'
const defaultTitle = 'Paseo Code - Agent Coding Workspace'
const defaultDescription =
  'Turn agent coding work into supervised plans, sandboxed execution, review-ready outputs, pull request handoff, and a clean checkout path for teams.'

const canonicalLinkId = 'paseocode-canonical-link'
const structuredDataScriptId = 'paseocode-structured-data'

type StructuredDataRecord = Record<string, unknown>

export type SeoDocument = {
  title: string
  description: string
  canonicalUrl: string
  robots: string
  structuredData: StructuredDataRecord[]
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function resolveCanonicalOrigin(origin: string) {
  try {
    const url = new URL(origin)
    if (url.hostname.endsWith('.pages.dev') || url.hostname.endsWith('.workers.dev')) {
      return url.origin
    }
  } catch {}

  return liveOrigin
}

function buildCanonicalUrl(origin: string, pathname: string) {
  return new URL(normalizePathname(pathname), `${resolveCanonicalOrigin(origin)}/`).toString()
}

function buildWebPageStructuredData(title: string, description: string, canonicalUrl: string): StructuredDataRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
  }
}

function buildBreadcrumb(origin: string, pathname: string, label: string): StructuredDataRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: buildCanonicalUrl(origin, '/') },
      { '@type': 'ListItem', position: 2, name: label, item: buildCanonicalUrl(origin, pathname) },
    ],
  }
}

function buildFaqStructuredData(page: KeywordPage): StructuredDataRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function buildSeoDocument(args: {
  pathname: string
  routeView: RouteView
  publicAppOrigin: string
  keywordPage: KeywordPage | null
}): SeoDocument {
  const { pathname, routeView, publicAppOrigin, keywordPage } = args
  const normalizedPath = normalizePathname(pathname)
  const canonicalUrl = buildCanonicalUrl(publicAppOrigin, normalizedPath)

  if (routeView === 'home') {
    return {
      title: defaultTitle,
      description: defaultDescription,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: siteName,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '14.50',
            highPrice: '124.50',
            availability: 'https://schema.org/InStock',
          },
          description: defaultDescription,
          url: canonicalUrl,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url: canonicalUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${canonicalUrl}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        buildWebPageStructuredData(defaultTitle, defaultDescription, canonicalUrl),
      ],
    }
  }

  if (routeView === 'pricing') {
    const title = 'Paseo Code Pricing | Studio Annual Agent Workspace'
    const description =
      'Compare Paseo Code Solo, Studio, and Scale plans. Studio annual is selected by default and annual billing is 50% cheaper than monthly.'
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        {
          '@context': 'https://schema.org',
          '@type': 'OfferCatalog',
          name: 'Paseo Code pricing',
          url: canonicalUrl,
        },
      ],
    }
  }

  if (routeView === 'keyword' && keywordPage) {
    const title = `${keywordPage.title} | ${siteName}`
    const keywordCanonical = buildCanonicalUrl(publicAppOrigin, keywordPage.path)
    return {
      title,
      description: keywordPage.description,
      canonicalUrl: keywordCanonical,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, keywordPage.description, keywordCanonical),
        buildBreadcrumb(publicAppOrigin, keywordPage.path, keywordPage.h1),
        buildFaqStructuredData(keywordPage),
      ],
    }
  }

  if (routeView === 'privacy') {
    const title = `Privacy | ${siteName}`
    const description = 'How Paseo Code handles analytics, checkout metadata, and managed-site interactions.'
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [buildWebPageStructuredData(title, description, canonicalUrl)],
    }
  }

  if (routeView === 'terms') {
    const title = `Terms | ${siteName}`
    const description = 'Terms for using the Paseo Code managed site, hosted payment flow, and related support.'
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [buildWebPageStructuredData(title, description, canonicalUrl)],
    }
  }

  if (routeView === 'checkout-done') {
    const title = `Checkout | ${siteName}`
    return {
      title,
      description: 'Completing your Paseo Code checkout.',
      canonicalUrl,
      robots: 'noindex,nofollow',
      structuredData: [buildWebPageStructuredData(title, 'Checkout completion.', canonicalUrl)],
    }
  }

  return {
    title: `Page not found | ${siteName}`,
    description: 'The requested Paseo Code page was not found.',
    canonicalUrl,
    robots: 'noindex,nofollow',
    structuredData: [buildWebPageStructuredData('Page not found', 'Missing page.', canonicalUrl)],
  }
}

function upsertMeta(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`)

  if (!(element instanceof HTMLMetaElement)) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertCanonicalLink(href: string) {
  let element =
    (document.head.querySelector(`#${canonicalLinkId}`) as HTMLLinkElement | null) ??
    (document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)

  if (!(element instanceof HTMLLinkElement)) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  element.id = canonicalLinkId
  element.rel = 'canonical'
  element.href = href
}

function upsertStructuredData(structuredData: StructuredDataRecord[]) {
  let element = document.head.querySelector(`#${structuredDataScriptId}`) as HTMLScriptElement | null

  if (!(element instanceof HTMLScriptElement)) {
    element = document.createElement('script')
    element.id = structuredDataScriptId
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  const payload =
    structuredData.length <= 1
      ? structuredData[0] ?? {}
      : {
          '@context': 'https://schema.org',
          '@graph': structuredData.map((item) => {
            const { '@context': _context, ...rest } = item
            return rest
          }),
        }

  element.textContent = JSON.stringify(payload)
}

export function syncSeoDocument(seo: SeoDocument) {
  document.title = seo.title
  upsertMeta('name', 'description', seo.description)
  upsertMeta('name', 'robots', seo.robots)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', siteName)
  upsertMeta('property', 'og:title', seo.title)
  upsertMeta('property', 'og:description', seo.description)
  upsertMeta('property', 'og:url', seo.canonicalUrl)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', seo.title)
  upsertMeta('name', 'twitter:description', seo.description)
  upsertCanonicalLink(seo.canonicalUrl)
  upsertStructuredData(seo.structuredData)
}
