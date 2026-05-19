const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!

const SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-read-private',
  'user-read-email',
].join(' ')

// Generate random string for PKCE
function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  randomValues.forEach(v => result += chars[v % chars.length])
  return result
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Start login flow
export async function loginWithSpotify() {
  const verifier = generateRandomString(128)
  const challenge = await generateCodeChallenge(verifier)
  localStorage.setItem('spotify_verifier', verifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

// Exchange code for token
export async function exchangeToken(code: string) {
  const verifier = localStorage.getItem('spotify_verifier')!

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  const data = await response.json()
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_token_expiry', 
      String(Date.now() + data.expires_in * 1000))
  }
  return data
}

// Get stored token
export function getToken() {
  const token = localStorage.getItem('spotify_token')
  const expiry = localStorage.getItem('spotify_token_expiry')
  if (!token || !expiry) return null
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem('spotify_token')
    return null
  }
  return token
}

// Logout
export function logout() {
  localStorage.removeItem('spotify_token')
  localStorage.removeItem('spotify_token_expiry')
  localStorage.removeItem('spotify_verifier')
  window.location.href = '/'
}