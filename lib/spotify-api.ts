const BASE_URL = 'https://api.spotify.com/v1'

async function fetchSpotify(endpoint: string, token: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Spotify API error: ${response.status}`)
  return response.json()
}

// Get current user profile
export async function getUserProfile(token: string) {
  return fetchSpotify('/me', token)
}

// Get top tracks — short_term=4weeks, medium_term=6months, long_term=alltime
export async function getTopTracks(token: string, timeRange: string, limit = 20) {
  return fetchSpotify(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    token
  )
}

// Get top artists
export async function getTopArtists(token: string, timeRange: string, limit = 20) {
  return fetchSpotify(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    token
  )
}

// Get recently played (for heatmap)
export async function getRecentlyPlayed(token: string, limit = 50) {
  return fetchSpotify(
    `/me/player/recently-played?limit=${limit}`,
    token
  )
}

// Get audio features for mood analysis
export async function getAudioFeatures(token: string, trackIds: string[]) {
  const ids = trackIds.join(',')
  return fetchSpotify(`/audio-features?ids=${ids}`, token)
}

// Extract genres from top artists
export function extractGenres(artists: any[]) {
  const genreCount: Record<string, number> = {}
  artists.forEach(artist => {
    artist.genres?.forEach((genre: string) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1
    })
  })
  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }))
}

// Calculate mood score from audio features
export function calculateMoodScore(features: any[]) {
  if (!features?.length) return null
  const valid = features.filter(Boolean)
  const avg = (key: string) =>
    valid.reduce((sum, f) => sum + (f[key] || 0), 0) / valid.length

  return {
    energy: Math.round(avg('energy') * 100),
    valence: Math.round(avg('valence') * 100),   // happiness
    danceability: Math.round(avg('danceability') * 100),
    acousticness: Math.round(avg('acousticness') * 100),
    tempo: Math.round(avg('tempo')),
  }
}

// Build heatmap data from recently played
export function buildHeatmapData(recentTracks: any[]) {
  const grid: Record<string, number> = {}

  recentTracks.forEach(item => {
    const date = new Date(item.played_at)
    const hour = date.getHours()
    const day = date.getDay() // 0=Sun, 6=Sat
    const key = `${day}-${hour}`
    grid[key] = (grid[key] || 0) + 1
  })

  return grid
}

// Generate personality type from music data
export function getMusicPersonality(
  genres: { genre: string; count: number }[],
  mood: { energy: number; valence: number; danceability: number; acousticness: number } | null
) {
  if (!mood || !genres.length) return 'The Explorer'

  const topGenre = genres[0]?.genre || ''

  if (mood.energy > 70 && mood.danceability > 70) return 'The Party Starter'
  if (mood.valence > 70 && mood.energy > 60) return 'The Sunshine Soul'
  if (mood.acousticness > 60) return 'The Quiet Dreamer'
  if (topGenre.includes('hip-hop') || topGenre.includes('rap')) return 'The Lyricist'
  if (topGenre.includes('classical') || topGenre.includes('jazz')) return 'The Connoisseur'
  if (mood.energy < 40) return 'The Deep Thinker'
  if (mood.danceability > 65) return 'The Groove Hunter'
  return 'The Eclectic Soul'
}