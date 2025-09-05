function base64UrlDecode(input: string): string {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  // Pad out with standard base64 required padding characters
  const pad = input.length % 4
  if (pad) input += '='.repeat(4 - pad)
  // Use browser's atob; this app runs in the browser
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(input), function (c: string) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
}

export function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(base64UrlDecode(parts[1] || ''))
    const exp = payload?.exp
    if (typeof exp === 'number') return exp
    return null
  } catch {
    return null
  }
}
