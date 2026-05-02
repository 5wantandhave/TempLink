const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateCode(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length]
  }
  return code
}
