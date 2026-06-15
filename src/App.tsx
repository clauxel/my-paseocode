import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  ExternalLink,
  FileText,
  Github,
  Layers3,
  LockKeyhole,
  Network,
  Play,
  Rocket,
  Route,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from 'lucide-react'

import { findKeywordPageByPath, keywordPages, type KeywordPage } from './content/keyword-pages'
import { trackEvent, trackPageView } from './lib/analytics'
import {
  analyzeMissionSelection,
  channelOptions,
  defaultMissionSelection,
  goalOptions,
  memoryOptions,
  outputOptions,
  runtimeOptions,
  safetyOptions,
  type MissionSelection,
  type PlanId,
} from './lib/mission'
import { buildSeoDocument, syncSeoDocument } from './lib/seo'
import { deriveRouteView, normalizePathname, scrollToHashTarget, type RouteView } from './lib/routing'

const defaultPublicAppOrigin = 'https://paseocode.space'
const pagesApiBaseUrl = 'https://my-paseocode.yangdengkui01.workers.dev'

type Billing = 'monthly' | 'annual'

type CheckoutModalState = {
  planId: PlanId
  billing: Billing
  loadingKey: string
  status: 'loading' | 'popup' | 'retry'
  checkoutUrl?: string
}

const ctaPrimary = 'Choose Studio annual'
const ctaCheckout = 'Checkout Studio annual'

const plans: Array<{
  id: PlanId
  name: string
  shortName: string
  tagline: string
  monthlyUsd: number
  bullets: string[]
  popular?: boolean
}> = [
  {
    id: 'solo',
    name: 'Solo',
    shortName: 'Solo',
    tagline: 'A focused pilot for one repository mission and a small review loop.',
    monthlyUsd: 29,
    bullets: ['One mission lane', 'Session notes', 'Sandbox readiness review', 'Email onboarding support'],
  },
  {
    id: 'studio',
    name: 'Studio',
    shortName: 'Studio',
    tagline: 'The default workspace for serious Paseo Code evaluation with memory and review.',
    monthlyUsd: 99,
    popular: true,
    bullets: ['Project memory', 'Sub-agent mission planning', 'Sandboxed command workflow', 'Priority checkout onboarding'],
  },
  {
    id: 'scale',
    name: 'Scale',
    shortName: 'Scale',
    tagline: 'For private runners, GitHub automation, API embedding, and operational controls.',
    monthlyUsd: 249,
    bullets: ['Private runner planning', 'GitHub workflow design', 'Approval and audit model', 'Dedicated rollout support'],
  },
]

const proofItems = [
  { label: 'Default plan', value: 'Studio', detail: 'Middle tier selected before checkout' },
  { label: 'Annual savings', value: '50%', detail: 'Annual billing is active by default' },
  { label: 'Checkout flow', value: 'Popup', detail: 'Creem opens centered while the page stays visible' },
  { label: 'Agent lanes', value: '4', detail: 'Plan, inspect, implement, and verify before handoff' },
]

const workflowCards = [
  {
    title: 'Repository-first planning',
    body: 'Start with the task, branch, tests, and acceptance criteria so the agent has a concrete path.',
    icon: <Github size={21} />,
  },
  {
    title: 'Sub-agent execution',
    body: 'Split research, implementation, verification, and handoff into smaller lanes with clearer trails.',
    icon: <Network size={21} />,
  },
  {
    title: 'Project memory',
    body: 'Keep conventions, release choices, and recurring commands available instead of relearning them every run.',
    icon: <BrainCircuit size={21} />,
  },
  {
    title: 'Sandboxed checkout path',
    body: 'Make tool boundaries and plan choice visible, then open secure Creem payment without replacing the page.',
    icon: <ShieldCheck size={21} />,
  },
]

const trustLinks = [
  {
    label: 'Paseo GitHub path',
    href: '/paseo-github',
    icon: <Github size={17} />,
    internal: true,
  },
  {
    label: 'Paseo sh guide',
    href: '/paseo-sh',
    icon: <TerminalSquare size={17} />,
    internal: true,
  },
  {
    label: 'Agent harness reference',
    href: 'https://github.com/bytedance/deer-flow',
    icon: <ExternalLink size={17} />,
  },
]

const legalPrivacySections = [
  {
    title: 'What we collect',
    paragraphs: [
      'Paseo Code collects only the information reasonably needed to operate this website, process checkout, understand product usage, prevent abuse, and respond to support requests.',
      'This may include page views, referral and UTM data, browser and device information, approximate location derived from network data, checkout metadata, support emails, and information you intentionally submit.',
      'The public planner runs from your selections in the browser. It does not require you to upload private repositories, credentials, secrets, files, source code, or production data.',
    ],
  },
  {
    title: 'How we use information',
    paragraphs: [
      'We use analytics to understand which pages, plan choices, and checkout actions help visitors make a confident decision.',
      'We use checkout metadata to create payment sessions, confirm purchases, return users to the homepage, provide onboarding, detect fraud, and handle support.',
      'We do not sell personal information. We do not use private repository content for model training through this public website because the public website does not collect that content.',
    ],
  },
  {
    title: 'Service providers and third parties',
    paragraphs: [
      'We use service providers such as Cloudflare for hosting, security, routing, and analytics infrastructure, and Creem for hosted checkout and payment processing.',
      'Payment details are handled by the payment provider. We do not ask users to send card numbers, API keys, passwords, or repository secrets through email or this public planner.',
      'Third-party services process information under their own terms and privacy practices. Do not proceed with checkout or external links if you do not accept those practices.',
    ],
  },
  {
    title: 'Security, retention, and deletion',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational safeguards appropriate for a lightweight SaaS marketing and checkout site.',
      'No internet service can be guaranteed perfectly secure. Users are responsible for avoiding the submission of credentials, secrets, regulated data, or highly sensitive information unless a signed, appropriate agreement says otherwise.',
      'We retain information only as long as reasonably needed for the purposes described here, including tax, accounting, fraud prevention, security, dispute handling, and legal compliance.',
    ],
  },
  {
    title: 'Your choices and rights',
    paragraphs: [
      'Depending on your location, you may have rights to request access, correction, deletion, portability, restriction, or objection regarding personal information we control.',
      'California and other privacy laws may provide additional rights when their thresholds and conditions apply. We will not discriminate against users for exercising applicable privacy rights.',
      'To make a privacy or support request, email support@aigeamy.com. We may need to verify the request before acting on it.',
    ],
  },
  {
    title: 'Children, changes, and contact',
    paragraphs: [
      'Paseo Code is intended for business and developer audiences and is not directed to children under 13.',
      'We may update this policy when the product, providers, laws, or operations change. The version posted on this page controls from the time it is published.',
      'Questions about privacy, support, or data handling should be sent to support@aigeamy.com.',
    ],
  },
]

const legalTermsSections = [
  {
    title: 'Acceptance and service scope',
    paragraphs: [
      'By accessing Paseo Code, using the planner, opening checkout, purchasing a plan, or continuing to use the service, you agree to these Terms.',
      'Paseo Code provides a website, mission planner, pricing flow, hosted checkout, and related onboarding for supervised coding-agent workflows.',
      'The public website is not a promise that an agent will complete every task, replace human engineers, operate production systems safely without review, or produce legally compliant output without your supervision.',
    ],
  },
  {
    title: 'User responsibilities',
    paragraphs: [
      'You are responsible for the repositories, commands, prompts, data, secrets, credentials, third-party accounts, and instructions you provide or authorize.',
      'Do not upload or disclose API keys, passwords, private keys, regulated data, confidential third-party information, export-controlled material, or data you are not allowed to process.',
      'Any workflow that can read files, write files, run shell commands, call external tools, send messages, deploy code, or affect production systems must be operated with explicit permissions and human review.',
    ],
  },
  {
    title: 'AI and coding output',
    paragraphs: [
      'Agent and AI-assisted output may be incomplete, inaccurate, insecure, infringing, unsuitable, or wrong. You must independently review, test, validate, and approve output before relying on it.',
      'Paseo Code does not provide legal, financial, medical, security, compliance, investment, or professional advice. Any examples, plans, summaries, or generated materials are informational only.',
      'You are solely responsible for deciding whether generated code, documentation, recommendations, tests, or operational actions are safe, lawful, and appropriate for your use case.',
    ],
  },
  {
    title: 'Payments, renewals, and refunds',
    paragraphs: [
      'Payments are processed by Creem in a hosted popup window. Successful checkouts return the user to the homepage.',
      'Displayed annual pricing reflects a 50% discount versus the monthly run-rate for the same plan. Prices, plan names, features, and availability may change before purchase.',
      'Unless a separate written agreement says otherwise, purchases are final to the maximum extent permitted by law. If the payment provider, consumer law, or a written policy requires a refund, that required rule controls.',
      'Chargebacks, payment abuse, or attempted circumvention of checkout may result in suspension, cancellation, or refusal of service.',
    ],
  },
  {
    title: 'Prohibited use',
    paragraphs: [
      'You may not use Paseo Code to violate law, infringe rights, attack systems, distribute malware, bypass access controls, scrape where prohibited, spam, impersonate others, misrepresent AI output, or process data without authority.',
      'You may not reverse engineer, overload, interfere with, resell, frame, copy, or exploit the service except as expressly permitted in writing.',
      'We may suspend or terminate access, refuse checkout, preserve evidence, or cooperate with lawful requests when we believe use is unsafe, abusive, fraudulent, infringing, or unlawful.',
    ],
  },
  {
    title: 'Third-party services',
    paragraphs: [
      'Cloudflare, Creem, GitHub, model providers, browser tools, infrastructure providers, and other third-party services may be involved in hosting, checkout, integrations, or customer workflows.',
      'We are not responsible for third-party services, third-party outages, payment provider decisions, external repositories, external links, or third-party terms.',
      'Your use of third-party services is governed by the applicable third-party terms, privacy policies, account rules, and fees.',
    ],
  },
  {
    title: 'No warranties',
    paragraphs: [
      'Paseo Code is provided as is and as available. To the maximum extent permitted by law, we disclaim all warranties, whether express, implied, statutory, or otherwise.',
      'We do not warrant uninterrupted service, error-free operation, complete security, merchantability, fitness for a particular purpose, non-infringement, accuracy of AI output, revenue results, rankings, conversion results, or business outcomes.',
      'You use the service at your own risk and remain responsible for backups, testing, review, security, legal compliance, and production decisions.',
    ],
  },
  {
    title: 'Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, Paseo Code and its operators, affiliates, suppliers, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or lost-profit damages.',
      'To the maximum extent permitted by law, total liability for any claim relating to the service is limited to the greater of 100 USD or the amount you paid for Paseo Code in the three months before the event giving rise to the claim.',
      'These limits apply whether the claim is based on contract, tort, negligence, strict liability, statute, warranty, or any other theory, even if a remedy fails of its essential purpose.',
    ],
  },
  {
    title: 'Indemnity',
    paragraphs: [
      'You agree to defend, indemnify, and hold harmless Paseo Code and its operators, affiliates, suppliers, and service providers from claims, damages, liabilities, losses, costs, and fees arising from your use of the service.',
      'This includes claims arising from your data, repositories, prompts, instructions, generated output, production use, third-party accounts, violation of law, infringement, breach of these Terms, or unauthorized use of credentials or systems.',
    ],
  },
  {
    title: 'Disputes',
    paragraphs: [
      'Before filing a claim, you agree to email support@aigeamy.com and give us 30 days to try to resolve the dispute informally.',
      'To the maximum extent permitted by law, disputes must be resolved individually and not as a class, collective, consolidated, private attorney general, or representative action.',
      'To the maximum extent permitted by law, disputes will be resolved by binding arbitration or the courts with proper jurisdiction for the operator, and you waive jury trial where that waiver is enforceable.',
      'If any part of these dispute terms is unenforceable, the remaining provisions continue to apply to the maximum extent permitted by law.',
    ],
  },
  {
    title: 'Changes, termination, and contact',
    paragraphs: [
      'We may update these Terms, change or discontinue features, refuse transactions, suspend access, or terminate service when reasonably necessary for security, legal, operational, abuse-prevention, or business reasons.',
      'If a provision is unenforceable, the rest of these Terms remains effective. A failure to enforce a provision is not a waiver.',
      'Questions, notices, support requests, and dispute notices should be sent to support@aigeamy.com.',
    ],
  },
]

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
  if (configured) return configured
  if (window.location.hostname.endsWith('.pages.dev')) return pagesApiBaseUrl
  return ''
}

function resolveApiUrl(path: string) {
  const apiBaseUrl = resolveApiBaseUrl()
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const rawText = await response.text()
  if (!rawText.trim()) return null
  try {
    return JSON.parse(rawText) as T
  } catch {
    return null
  }
}

async function createCheckoutSession(planId: PlanId, billing: Billing, endpoint = '/api/checkout') {
  const response = await fetch(resolveApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, billing }),
  })

  const payload = await readJsonResponse<{ ok?: boolean; checkoutUrl?: string; error?: string }>(response)
  if (!response.ok || !payload?.ok || !payload.checkoutUrl) {
    throw new Error(payload?.error || 'Checkout could not be started.')
  }

  return payload.checkoutUrl
}

function openCenteredCheckoutWindow() {
  const width = 560
  const height = 760
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
  const popup = window.open(
    'about:blank',
    'paseocode-checkout',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  )

  if (popup) {
    try {
      popup.document.title = 'Opening secure checkout'
      popup.document.body.innerHTML =
        '<main style="min-height:100vh;display:grid;place-items:center;background:#111827;color:#f8fafc;font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:32px"><div><h1 style="font-size:22px;margin:0 0 8px">Opening secure checkout...</h1><p style="margin:0;color:#cbd5e1">Your Paseo Code payment window is being prepared.</p></div></main>'
    } catch {
      /* Existing named checkout windows can be cross-origin. */
    }
  }

  return popup
}

function sendPopupToCheckout(popup: Window | null, url: string) {
  if (!popup || popup.closed) return false

  try {
    popup.location.replace(url)
    popup.focus()
    return true
  } catch {
    return false
  }
}

function useRouteSignal() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [search, setSearch] = useState(() => window.location.search)

  function navigate(to: string) {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setPathname(url.pathname)
    setSearch(url.search)

    if (url.hash) {
      requestAnimationFrame(() => scrollToHashTarget(url.hash))
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPop = () => {
      setPathname(window.location.pathname)
      setSearch(window.location.search)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return { pathname, search, navigate }
}

function CheckoutDoneBridge({ publicAppOrigin }: { publicAppOrigin: string }) {
  useEffect(() => {
    const origin = window.location.origin || new URL(publicAppOrigin).origin

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'paseocode-checkout-complete' }, origin)
      return
    }

    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'paseocode-checkout-complete' }, origin)
      } catch {
        /* The opener may be closed or cross-origin. */
      }
      window.close()
      return
    }

    window.location.replace(`${origin}/?payment=success`)
  }, [publicAppOrigin])

  return (
    <main className="df-main">
      <section className="df-center-panel">
        <p className="df-eyebrow">Checkout</p>
        <h1>Finishing checkout...</h1>
        <p className="df-muted">You will return to the Paseo Code homepage when the hosted payment session closes.</p>
      </section>
    </main>
  )
}

export default function App() {
  const { pathname, search, navigate } = useRouteSignal()
  const routeView: RouteView = useMemo(() => deriveRouteView(pathname), [pathname])
  const normalizedPath = normalizePathname(pathname)
  const keywordPage = useMemo(() => findKeywordPageByPath(pathname), [pathname])

  const [publicAppOrigin, setPublicAppOrigin] = useState(defaultPublicAppOrigin)
  const [headerCompact, setHeaderCompact] = useState(() => window.scrollY > 18)
  const [billing, setBilling] = useState<Billing>('annual')
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('studio')
  const [checkoutLoadingKey, setCheckoutLoadingKey] = useState<string | null>(null)
  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState | null>(null)
  const [missionSelection, setMissionSelection] = useState<MissionSelection>(defaultMissionSelection)

  const mission = useMemo(() => analyzeMissionSelection(missionSelection), [missionSelection])

  useEffect(() => {
    let cancelled = false
    fetch(resolveApiUrl('/api/runtime'))
      .then((response) => readJsonResponse<{ publicAppOrigin?: string }>(response))
      .then((payload) => {
        if (!cancelled && payload?.publicAppOrigin) {
          setPublicAppOrigin(payload.publicAppOrigin)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const seo = buildSeoDocument({
      pathname,
      routeView,
      publicAppOrigin,
      keywordPage,
    })
    syncSeoDocument(seo)
  }, [keywordPage, pathname, publicAppOrigin, routeView])

  useEffect(() => {
    const onScroll = () => setHeaderCompact(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    trackPageView(`${pathname}${search}`)
  }, [pathname, search])

  useEffect(() => {
    const allowed = new Set([window.location.origin, new URL(publicAppOrigin).origin])
    const onMessage = (event: MessageEvent) => {
      if (!allowed.has(event.origin)) return
      if (event.data?.type === 'paseocode-checkout-complete') {
        setCheckoutModal(null)
        trackEvent('checkout_complete_return', { path: pathname })
        navigate('/?payment=success')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate, pathname, publicAppOrigin])

  useEffect(() => {
    const hash = window.location.hash
    if (hash) requestAnimationFrame(() => scrollToHashTarget(hash))
  }, [pathname])

  function updateMissionSelection<Key extends keyof MissionSelection>(key: Key, value: MissionSelection[Key]) {
    setMissionSelection((current) => ({ ...current, [key]: value }))
    trackEvent('mission_planner_change', { key, value })
  }

  async function startHostedCheckout(planId: PlanId, nextBilling: Billing, loadingKey: string, provider = 'creem') {
    setSelectedPlanId(planId)
    setBilling(nextBilling)
    setCheckoutLoadingKey(loadingKey)
    setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'loading' })
    trackEvent('checkout_start', { planId, billing: nextBilling })

    const popup = openCenteredCheckoutWindow()

    try {
      const url = await createCheckoutSession(planId, nextBilling, provider === 'nowpayments' ? '/api/nowpayments-checkout' : '/api/checkout')
      const popupOpened = sendPopupToCheckout(popup, url)
      if (!popupOpened) {
        try {
          if (popup && !popup.closed) popup.close()
        } catch {}
        throw new Error('Popup could not be opened.')
      }

      setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'popup', checkoutUrl: url })
      trackEvent('checkout_popup_opened', { planId, billing: nextBilling })
    } catch (error) {
      try {
        if (popup && !popup.closed) popup.close()
      } catch {}
      setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'retry' })
      trackEvent('checkout_error', {
        planId,
        billing: nextBilling,
        message: error instanceof Error ? error.message : 'unknown',
      })
    } finally {
      setCheckoutLoadingKey(null)
    }
  }

  function chooseStudioAnnual(source: string) {
    setSelectedPlanId('studio')
    setBilling('annual')
    trackEvent('choose_studio_annual', { source })
    navigate('/pricing#pricing')
  }

  function openPage(path: string) {
    trackEvent('internal_page_open', { path })
    navigate(path)
  }

  const renderHeader = () => (
    <header className={`df-header${headerCompact ? ' compact' : ''}`}>
      <div className="df-header-inner">
        <a
          className="df-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <span className="df-brand-mark" aria-hidden>
            <Route size={20} />
          </span>
          <span className="df-brand-copy">
            <strong>Paseo Code</strong>
            <span>Agent coding workspace</span>
          </span>
        </a>

        <nav className="df-nav" aria-label="Primary">
          <a
            href="/#planner"
            onClick={(event) => {
              event.preventDefault()
              navigate('/#planner')
            }}
          >
            Planner
          </a>
          <a
            href="/paseo-github"
            onClick={(event) => {
              event.preventDefault()
              openPage('/paseo-github')
            }}
          >
            GitHub
          </a>
          <a
            href="/paseo-agent"
            onClick={(event) => {
              event.preventDefault()
              openPage('/paseo-agent')
            }}
          >
            Agent
          </a>
          <a
            href="/pricing"
            onClick={(event) => {
              event.preventDefault()
              openPage('/pricing')
            }}
          >
            Pricing
          </a>
        </nav>

        <button type="button" className="df-btn df-btn-primary df-header-cta" onClick={() => chooseStudioAnnual('header')}>
          <Rocket size={16} />
          {ctaPrimary}
        </button>
      </div>
    </header>
  )

  const renderCheckoutModal = () => {
    if (!checkoutModal) return null

    const checkoutUrl = checkoutModal.status === 'popup' ? checkoutModal.checkoutUrl : undefined

    return (
      <div className="df-checkout-backdrop" role="presentation">
        <section className="df-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <button
            type="button"
            className="df-checkout-close"
            aria-label="Close checkout"
            onClick={() => {
              setCheckoutModal(null)
              trackEvent('checkout_overlay_closed', { status: checkoutModal.status })
            }}
          >
            <X size={18} />
          </button>
          {checkoutUrl ? (
            <div className="df-checkout-copy">
              <p className="df-eyebrow">Secure checkout</p>
              <h2 id="checkout-title">Creem checkout opened.</h2>
              <p className="df-muted">
                Complete payment in the centered popup. This page stays in place and returns to the homepage after success.
              </p>
              <div className="df-checkout-actions">
                <a className="df-btn df-btn-primary" href={checkoutUrl} target="_blank" rel="noreferrer noopener">
                  Focus payment window
                </a>
                <button type="button" className="df-btn df-btn-ghost" onClick={() => setCheckoutModal(null)}>
                  Keep reviewing
                </button>
              </div>
            </div>
          ) : checkoutModal.status === 'loading' ? (
            <div className="df-checkout-loading" aria-live="polite">
              <span />
              Preparing secure checkout...
            </div>
          ) : (
            <div className="df-checkout-copy">
              <p className="df-eyebrow">Popup needed</p>
              <h2 id="checkout-title">Checkout could not open yet.</h2>
              <p className="df-muted">
                Allow the payment popup and try again. Paseo Code keeps payment in a separate Creem window so the original page is not replaced.
              </p>
              <div className="df-checkout-actions">
                <button
                  type="button"
                  className="df-btn df-btn-primary"
                  onClick={() => void startHostedCheckout(checkoutModal.planId, checkoutModal.billing, checkoutModal.loadingKey)}
                >
                  Try checkout again
                </button>
                <button type="button" className="df-btn df-btn-ghost" onClick={() => setCheckoutModal(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  const renderOptionButtons = <Key extends keyof MissionSelection>(
    key: Key,
    options: Array<{ id: MissionSelection[Key]; label: string; summary: string }>,
  ) => (
    <div className="df-option-grid">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="df-option"
          data-active={missionSelection[key] === option.id ? 'true' : 'false'}
          onClick={() => updateMissionSelection(key, option.id)}
        >
          <strong>{option.label}</strong>
          <span>{option.summary}</span>
        </button>
      ))}
    </div>
  )

  const renderFlowMap = () => (
    <div className="df-flow-map" aria-hidden>
      <div className="df-flow-node lead">
        <Bot size={22} />
        <strong>Planner</strong>
      </div>
      <div className="df-flow-rail" />
      <div className="df-flow-node">
        <Sparkles size={19} />
        <span>Research</span>
      </div>
      <div className="df-flow-node">
        <Code2 size={19} />
        <span>Code</span>
      </div>
      <div className="df-flow-node">
        <Boxes size={19} />
        <span>Sandbox</span>
      </div>
      <div className="df-flow-node">
        <FileText size={19} />
        <span>Review</span>
      </div>
    </div>
  )

  const renderMissionPanel = () => (
    <aside className="df-workspace-panel" id="planner" aria-label="Paseo Code mission planner">
      <div className="df-panel-top">
        <div>
          <p className="df-eyebrow">Mission planner</p>
          <h2>{mission.headline}</h2>
        </div>
        <div className="df-score">
          <strong>{mission.fitScore}</strong>
          <span>{mission.fitLabel}</span>
        </div>
      </div>

      {renderFlowMap()}

      <div className="df-choice-stack">
        <section>
          <div className="df-choice-label">Mission</div>
          {renderOptionButtons('goal', goalOptions)}
        </section>
        <section className="df-split-options">
          <div>
            <div className="df-choice-label">Runtime</div>
            {renderOptionButtons('runtime', runtimeOptions)}
          </div>
          <div>
            <div className="df-choice-label">Memory</div>
            {renderOptionButtons('memory', memoryOptions)}
          </div>
        </section>
        <section className="df-split-options">
          <div>
            <div className="df-choice-label">Safety</div>
            {renderOptionButtons('safety', safetyOptions)}
          </div>
          <div>
            <div className="df-choice-label">Channel</div>
            {renderOptionButtons('channel', channelOptions)}
          </div>
        </section>
        <section>
          <div className="df-choice-label">Output</div>
          {renderOptionButtons('output', outputOptions)}
        </section>
      </div>

      <div className="df-result-grid">
        {mission.modules.map((module) => (
          <article key={module.label}>
            <span>{module.label}</span>
            <strong>{module.detail}</strong>
          </article>
        ))}
      </div>

      <div className="df-next-box">
        <div>
          <p className="df-eyebrow">Recommended next move</p>
          <h3>{mission.operatorMessage}</h3>
          <p>
            {mission.runShape} with {mission.confidence.toLowerCase()} fit confidence.
          </p>
        </div>
        <button type="button" className="df-btn df-btn-primary" onClick={() => chooseStudioAnnual('planner')}>
          <Play size={18} />
          {ctaPrimary}
        </button>
      </div>
    </aside>
  )

  const renderPricingSection = (standalone = false) => (
    <section className={`df-section df-pricing-section${standalone ? ' standalone' : ''}`} id="pricing">
      <div className="df-section-head df-pricing-head">
        <div>
          <p className="df-eyebrow">Pricing</p>
          <h2>Studio is selected because real coding-agent work needs memory, sandboxing, and review room.</h2>
          <p>Annual billing is active by default and is 50% cheaper than paying month to month.</p>
        </div>
        <div className="df-cycle" role="group" aria-label="Billing cycle">
          <button
            type="button"
            data-active={billing === 'monthly' ? 'true' : 'false'}
            onClick={() => {
              setBilling('monthly')
              trackEvent('billing_cycle_change', { billing: 'monthly' })
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            data-active={billing === 'annual' ? 'true' : 'false'}
            onClick={() => {
              setBilling('annual')
              trackEvent('billing_cycle_change', { billing: 'annual' })
            }}
          >
            Annual - 50% off
          </button>
        </div>
      </div>

      <div className="df-plan-grid">
        {plans.map((plan) => {
          const monthly = billing === 'annual' ? plan.monthlyUsd * 0.5 : plan.monthlyUsd
          const strike = billing === 'annual' ? plan.monthlyUsd : null
          const loadingKey = `plan-${plan.id}-${billing}`
          const active = selectedPlanId === plan.id

          return (
            <article className="df-plan-card" data-popular={plan.popular ? 'true' : 'false'} data-active={active ? 'true' : 'false'} key={plan.id}>
              {plan.popular ? <span className="df-plan-badge">Default choice</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.tagline}</p>
              <div className="df-price-line">
                {formatMoney(monthly)}
                <small>/mo</small>
                {strike ? <span>{formatMoney(strike)}</span> : null}
              </div>
              <strong className="df-billing-note">
                {billing === 'annual' ? `${formatMoney(monthly * 12)} billed annually` : 'Billed monthly'}
              </strong>
              <ul>
                {plan.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="df-plan-actions">
                <button
                  type="button"
                  className={plan.popular ? 'df-btn df-btn-primary' : 'df-btn df-btn-ghost'}
                  onClick={() => void startHostedCheckout(plan.id, billing, loadingKey)}
                  onMouseEnter={() => setSelectedPlanId(plan.id)}
                  disabled={checkoutLoadingKey !== null}
                >
                  {checkoutLoadingKey === loadingKey ? 'Opening secure checkout...' : plan.id === 'studio' ? ctaCheckout : `Checkout ${plan.shortName} ${billing}`}
                </button>
                <button
                  type="button"
                  className="df-btn df-btn-ghost"
                  onClick={() => void startHostedCheckout(plan.id, billing, `${loadingKey}-wallet`, 'nowpayments')}
                  disabled={checkoutLoadingKey !== null}
                >
                  {checkoutLoadingKey === `${loadingKey}-wallet` ? 'Opening USDC wallet...' : 'Pay with USDC Wallet'}
                </button>
                {active ? <span className="df-plan-selected">Selected</span> : null}
              </div>
            </article>
          )
        })}
      </div>

      {standalone ? (
        <div className="df-faq-grid">
          <article>
            <h3>Why is Studio selected first?</h3>
            <p>Most teams need project memory, sandbox guidance, and a reviewable agent lane. Solo is useful for a pilot, but Studio is the practical default.</p>
          </article>
          <article>
            <h3>Why annual by default?</h3>
            <p>Agent coding evaluation usually takes more than a month. Annual pricing cuts the monthly run-rate by 50%.</p>
          </article>
          <article>
            <h3>Does payment replace this page?</h3>
            <p>No. Checkout opens in a centered Creem popup and the product page stays visible behind a blurred overlay.</p>
          </article>
        </div>
      ) : null}
    </section>
  )

  const renderHome = () => {
    const paymentSuccess = new URLSearchParams(search).get('payment') === 'success'

    return (
      <main className="df-main">
        {paymentSuccess ? (
          <section className="df-success-banner">
            <CheckCircle2 size={18} />
            Payment received. Paseo Code onboarding will continue from the email used at checkout.
          </section>
        ) : null}

        <section className="df-hero">
          <div className="df-hero-copy">
            <p className="df-eyebrow">Paseo Code agent workspace</p>
            <h1>Turn coding-agent runs into reviewable work.</h1>
            <p className="df-lede">
              Paseo Code helps teams move from a repository mission to planned agent lanes, sandboxed execution, project memory, and a Studio annual checkout that keeps the page in place.
            </p>

            <div className="df-hero-actions">
              <button type="button" className="df-btn df-btn-primary" onClick={() => chooseStudioAnnual('hero')}>
                <Rocket size={18} />
                {ctaPrimary}
              </button>
              <button
                type="button"
                className="df-btn df-btn-ghost"
                onClick={() => {
                  trackEvent('pricing_review', { source: 'hero-secondary' })
                  navigate('/pricing#pricing')
                }}
              >
                <Layers3 size={18} />
                Review plans
              </button>
              <button type="button" className="df-btn df-btn-subtle" onClick={() => openPage('/paseo-code')}>
                <Code2 size={18} />
                See the workflow
              </button>
            </div>
            <p className="df-payment-note">
              <CheckCircle2 size={16} />
              <span>Studio annual selected. Annual saves 50%. Hosted SaaS: pay here, then use the managed workspace; no self-hosting needed.</span>
            </p>

            <div className="df-trust-row">
              {trustLinks.map((link) =>
                link.internal ? (
                  <a
                    href={link.href}
                    key={link.href}
                    onClick={(event) => {
                      event.preventDefault()
                      openPage(link.href)
                    }}
                  >
                    {link.icon}
                    {link.label}
                    <ChevronRight size={13} />
                  </a>
                ) : (
                  <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
                    {link.icon}
                    {link.label}
                    <ExternalLink size={13} />
                  </a>
                ),
              )}
            </div>

            <div className="df-hero-proof">
              <div>
                <span>Default path</span>
                <strong>Planner to Studio annual to Creem popup to homepage return</strong>
              </div>
              <div>
                <span>Best-fit work</span>
                <strong>Bug fixes, feature lanes, codebase research, and release notes with explicit tool boundaries</strong>
              </div>
            </div>
          </div>

          {renderMissionPanel()}
        </section>

        <section className="df-proof-strip" aria-label="Paseo Code proof points">
          {proofItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="df-section">
          <div className="df-section-head">
            <p className="df-eyebrow">Operating model</p>
            <h2>The first screen answers the buyer's real question: can this agent touch code without becoming opaque?</h2>
            <p>
              Paseo Code starts with mission fit, then shows safety, memory, plan choice, and checkout in one calm path.
            </p>
          </div>

          <div className="df-card-grid">
            {workflowCards.map((card) => (
              <article className="df-card" key={card.title}>
                <div className="df-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="df-section df-signal-section">
          <div className="df-section-head">
            <p className="df-eyebrow">Trust signals</p>
            <h2>Agent coding works best when the task, tools, memory, and approval points are visible before payment.</h2>
          </div>
          <div className="df-signal-grid">
            <article>
              <Clock3 size={20} />
              <h3>Start with one bounded mission</h3>
              <p>A focused repository task beats a vague promise that the agent can do everything.</p>
            </article>
            <article>
              <Code2 size={20} />
              <h3>Keep execution inspectable</h3>
              <p>Commands, files, tests, and generated code need a review trail before handoff.</p>
            </article>
            <article>
              <LockKeyhole size={20} />
              <h3>Default to safer boundaries</h3>
              <p>Sandbox, credentials, and external actions should stay explicit from the first run.</p>
            </article>
          </div>
        </section>

        {renderPricingSection(false)}

        <section className="df-section">
          <div className="df-section-head">
            <p className="df-eyebrow">Guides</p>
            <h2>Common Paseo searches get practical answers instead of thin doorway pages.</h2>
            <p>Each guide helps a visitor decide how the product fits a different starting intent.</p>
          </div>
          <div className="df-guide-grid">
            {[
              ...keywordPages,
              {
                path: '/pricing',
                eyebrow: 'Pricing',
                h1: 'Paseo Code pricing',
                intent: 'Choose Solo, Studio, or Scale with Studio annual already selected.',
              },
            ].map((page) => (
              <a
                className="df-guide-card"
                href={page.path}
                key={page.path}
                onClick={(event) => {
                  event.preventDefault()
                  openPage(page.path)
                }}
              >
                <span>{page.eyebrow}</span>
                <strong>{page.h1}</strong>
                <p>{page.intent}</p>
                <ChevronRight size={18} />
              </a>
            ))}
          </div>
        </section>
      </main>
    )
  }

  const renderKeywordPage = (page: KeywordPage) => (
    <main className="df-main">
      <article className="df-article">
        <a
          className="df-back-link"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <ArrowRight size={16} />
          Back to Paseo Code
        </a>
        <p className="df-eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="df-lede">{page.lede}</p>
        <div className="df-article-intent">
          <strong>Best for</strong>
          <span>{page.intent}</span>
        </div>

        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section>
          <h2>Common questions</h2>
          <div className="df-faq-list">
            {page.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="df-article-cta">
          <div>
            <p className="df-eyebrow">Recommended next step</p>
            <h2>Use the planner first, then keep Studio annual selected if the mission fit is clear.</h2>
            <p>Checkout stays in a centered Creem popup, with annual billing selected by default.</p>
          </div>
          <div className="df-article-cta-actions">
            <button type="button" className="df-btn df-btn-primary" onClick={() => chooseStudioAnnual(`article-${page.path}`)}>
              <Play size={18} />
              {page.ctaLabel}
            </button>
            <button type="button" className="df-btn df-btn-ghost" onClick={() => navigate('/#planner')}>
              <Zap size={18} />
              Run planner
            </button>
          </div>
        </aside>
      </article>
    </main>
  )

  const renderPricingPage = () => (
    <main className="df-main">
      <section className="df-pricing-page-hero">
        <p className="df-eyebrow">Pricing</p>
        <h1>Paseo Code pricing starts with Studio selected and annual billing already on.</h1>
        <p className="df-lede">
          Solo is for one bounded pilot. Studio is the default for a serious agent coding workspace. Scale is for private runners, GitHub automation, and operational controls.
        </p>
      </section>
      {renderPricingSection(true)}
    </main>
  )

  const renderLegalPage = (title: string, intro: string, sections: typeof legalPrivacySections) => (
    <main className="df-main">
      <article className="df-article">
        <p className="df-eyebrow">Legal</p>
        <h1>{title}</h1>
        <p className="df-lede">{intro}</p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  )

  const renderNotFound = () => (
    <main className="df-main">
      <section className="df-center-panel">
        <p className="df-eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="df-muted">That route is not available.</p>
        <button type="button" className="df-btn df-btn-primary" onClick={() => navigate('/')}>
          Return home
        </button>
      </section>
    </main>
  )

  let body: React.ReactNode
  if (routeView === 'home' && normalizedPath === '/') {
    body = renderHome()
  } else if (routeView === 'keyword' && keywordPage) {
    body = renderKeywordPage(keywordPage)
  } else if (routeView === 'pricing') {
    body = renderPricingPage()
  } else if (routeView === 'privacy') {
    body = renderLegalPage(
      'Privacy Policy',
      'This policy covers how Paseo Code handles analytics, checkout, and related user interactions.',
      legalPrivacySections,
    )
  } else if (routeView === 'terms') {
    body = renderLegalPage(
      'Terms of Service',
      'These terms describe the limits and responsibilities of the Paseo Code site and its hosted payment flow.',
      legalTermsSections,
    )
  } else if (routeView === 'checkout-done') {
    body = <CheckoutDoneBridge publicAppOrigin={publicAppOrigin} />
  } else {
    body = renderNotFound()
  }

  return (
    <div className="df-shell">
      <div className="df-page-texture" aria-hidden />
      {renderHeader()}
      {body}
      {renderCheckoutModal()}
      <footer className="df-footer">
        <div className="df-footer-inner">
          <span>Paseo Code</span>
          <a
            href="/privacy"
            onClick={(event) => {
              event.preventDefault()
              navigate('/privacy')
            }}
          >
            Privacy
          </a>
          <a
            href="/terms"
            onClick={(event) => {
              event.preventDefault()
              navigate('/terms')
            }}
          >
            Terms
          </a>
          <a href="https://github.com/clauxel/my-paseocode" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://github.com/bytedance/deer-flow" target="_blank" rel="noreferrer">
            Reference
          </a>
          <a href="mailto:support@aigeamy.com">support@aigeamy.com</a>
        </div>
      </footer>
    </div>
  )
}
