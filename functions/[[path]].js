import { handleRequest } from '../worker/index.js'

export function onRequest(context) {
  const url = new URL(context.request.url)

  if (url.pathname.startsWith('/api/')) {
    return handleRequest(context.request, context.env)
  }

  if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') {
    return handleRequest(context.request, context.env)
  }

  return context.next()
}
