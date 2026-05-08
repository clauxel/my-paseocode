const visitorStorageKey = 'paseocode-analytics-visitor'
const sessionStorageKey = 'paseocode-analytics-session'
const queueStorageKey = 'paseocode-analytics-queue'
const sessionInactivityMs = 30 * 60 * 1000
const flushDelayMs = 1600
const maxQueueLength = 90
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
const pagesApiBaseUrl = 'https://my-paseocode.yangdengkui01.workers.dev'

type AnalyticsEvent = {
  id: string
  name: string
  path: string
  occurredAt: string
  visitorId: string
  sessionId: string
  referrerHost: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  metadata: Record<string, unknown>
}

let initialized = false
let pendingEvents: AnalyticsEvent[] = []
let flushTimer: number | null = null
let lastTrackedPath = ''

function resolveApiBaseUrl() {
  if (configuredApiBaseUrl) return configuredApiBaseUrl
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.pages.dev')) return pagesApiBaseUrl
  return ''
}

function resolveApiUrl(path: string) {
  const baseUrl = resolveApiBaseUrl()
  return baseUrl ? `${baseUrl}${path}` : path
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function getVisitorId() {
  try {
    const existing = localStorage.getItem(visitorStorageKey)
    if (existing) return existing
    const created = generateId()
    localStorage.setItem(visitorStorageKey, created)
    return created
  } catch {
    return generateId()
  }
}

function getSessionId() {
  const now = Date.now()

  try {
    const raw = sessionStorage.getItem(sessionStorageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; seenAt: number }
      if (parsed?.id && typeof parsed.seenAt === 'number' && now - parsed.seenAt < sessionInactivityMs) {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify({ id: parsed.id, seenAt: now }))
        return parsed.id
      }
    }

    const created = generateId()
    sessionStorage.setItem(sessionStorageKey, JSON.stringify({ id: created, seenAt: now }))
    return created
  } catch {
    return generateId()
  }
}

function getReferrerHost() {
  if (!document.referrer) return null

  try {
    return new URL(document.referrer).host
  } catch {
    return null
  }
}

function loadQueue() {
  try {
    const raw = localStorage.getItem(queueStorageKey)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      pendingEvents = parsed.slice(-maxQueueLength)
    }
  } catch {}
}

function persistQueue() {
  try {
    localStorage.setItem(queueStorageKey, JSON.stringify(pendingEvents.slice(-maxQueueLength)))
  } catch {}
}

function scheduleFlush() {
  if (flushTimer !== null) return
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    void flushAnalytics()
  }, flushDelayMs)
}

function initialize() {
  if (initialized) return
  initialized = true
  loadQueue()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushAnalytics(true)
    }
  })
  window.addEventListener('pagehide', () => {
    void flushAnalytics(true)
  })
}

function buildEvent(name: string, metadata: Record<string, unknown> = {}): AnalyticsEvent {
  const query = new URLSearchParams(window.location.search)
  return {
    id: generateId(),
    name,
    path: `${window.location.pathname}${window.location.search}`,
    occurredAt: new Date().toISOString(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    referrerHost: getReferrerHost(),
    utmSource: query.get('utm_source'),
    utmMedium: query.get('utm_medium'),
    utmCampaign: query.get('utm_campaign'),
    metadata,
  }
}

async function sendEvents(events: AnalyticsEvent[], useBeacon = false) {
  const body = JSON.stringify({ events })
  const endpoint = resolveApiUrl('/api/analytics/events')

  if (useBeacon && typeof navigator.sendBeacon === 'function') {
    return navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })

  return response.ok
}

export function trackEvent(name: string, metadata: Record<string, unknown> = {}) {
  initialize()
  pendingEvents = [...pendingEvents, buildEvent(name, metadata)].slice(-maxQueueLength)
  persistQueue()
  scheduleFlush()
}

export function trackPageView(pathname: string) {
  if (lastTrackedPath === pathname) return
  lastTrackedPath = pathname
  trackEvent('page_view', { title: document.title, pathname })
}

export async function flushAnalytics(useBeacon = false) {
  if (pendingEvents.length === 0) return true
  const batch = [...pendingEvents]

  try {
    const delivered = await sendEvents(batch, useBeacon)
    if (!delivered) return false
    pendingEvents = pendingEvents.slice(batch.length)
    persistQueue()
    return true
  } catch {
    return false
  }
}
