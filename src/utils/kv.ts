export interface Session {
  code: string
  type: 'text'
  text_content?: string
  expire_at: number
  one_time: boolean
  consumed: boolean
  created_at: number
}

export const EXPIRY_OPTIONS: Record<string, number> = {
  '5m': 5 * 60,
  '30m': 30 * 60,
  '2h': 2 * 60 * 60,
  '24h': 24 * 60 * 60,
}

export async function saveSession(
  kv: KVNamespace,
  session: Session,
  ttlSeconds: number
): Promise<void> {
  await kv.put(session.code, JSON.stringify(session), {
    expirationTtl: ttlSeconds,
  })
}

export async function getSession(
  kv: KVNamespace,
  code: string
): Promise<Session | null> {
  const raw = await kv.get(code)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export async function deleteSession(
  kv: KVNamespace,
  code: string
): Promise<void> {
  await kv.delete(code)
}

export async function markConsumed(
  kv: KVNamespace,
  session: Session
): Promise<void> {
  const updated: Session = { ...session, consumed: true }
  const remainingTtl = Math.max(60, Math.floor(session.expire_at - Date.now() / 1000))
  await kv.put(updated.code, JSON.stringify(updated), { expirationTtl: remainingTtl })
}

export function isExpired(session: Session): boolean {
  return Date.now() / 1000 > session.expire_at
}
