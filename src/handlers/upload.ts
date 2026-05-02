import type { Context } from 'hono'
import { generateCode } from '../utils/code'
import { EXPIRY_OPTIONS, saveSession } from '../utils/kv'
import type { Session } from '../utils/kv'

interface Env {
  KV: KVNamespace
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

export async function handleUpload(c: Context<{ Bindings: Env }>) {
  const body = await c.req.parseBody()
  const text = typeof body['text'] === 'string' ? body['text'].trim() : ''
  const expiry = typeof body['expiry'] === 'string' ? body['expiry'] : '5m'
  const oneTime = body['one_time'] === 'true'

  if (!text) {
    return c.json({ error: 'Text content is required' }, 400)
  }

  if (text.length > 100_000) {
    return c.json({ error: 'Text content too long (max 100KB)' }, 400)
  }

  const ttlSeconds = EXPIRY_OPTIONS[expiry] || 5 * 60
  const code = generateCode()
  const now = Math.floor(Date.now() / 1000)

  const session: Session = {
    code,
    type: 'text',
    text_content: text,
    expire_at: now + ttlSeconds,
    one_time: oneTime,
    consumed: false,
    created_at: now,
  }

  await saveSession(c.env.KV, session, ttlSeconds)

  const baseUrl = new URL(c.req.url).origin
  return c.json({
    code,
    link: `${baseUrl}/${code}`,
    expire_at: session.expire_at,
    one_time: session.one_time,
  })
}
