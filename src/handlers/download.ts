import type { Context } from 'hono'
import { deleteSession, getSession, isExpired, markConsumed } from '../utils/kv'

interface Env {
  KV: KVNamespace
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

export async function handleDownload(c: Context<{ Bindings: Env }>) {
  const code = c.req.param('code').toUpperCase()
  const session = await getSession(c.env.KV, code)

  if (!session) {
    return c.json({ error: 'Not found or expired' }, 404)
  }

  if (isExpired(session)) {
    await deleteSession(c.env.KV, code)
    return c.json({ error: 'Expired' }, 410)
  }

  if (session.one_time && session.consumed) {
    return c.json({ error: 'Already consumed' }, 410)
  }

  if (session.one_time) {
    await markConsumed(c.env.KV, session)
  }

  return c.json({
    type: session.type,
    text_content: session.text_content,
    one_time: session.one_time,
    expire_at: session.expire_at,
  })
}
