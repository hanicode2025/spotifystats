'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, logout } from '@/lib/spotify-auth'
import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
  getAudioFeatures,
  extractGenres,
  calculateMoodScore,
  getMusicPersonality,
} from '@/lib/spotify-api'

type TimeRange = 'short_term' | 'medium_term' | 'long_term'

export default function DashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [mood, setMood] = useState<any>(null)
  const [personality, setPersonality] = useState<string>('')
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tracks')

  useEffect(() => {
    const t = getToken()
    if (!t) { router.push('/'); return }
    setToken(t)
  }, [router])

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token, timeRange])

  async function loadData() {
    setLoading(true)
    try {
      const [prof, tracks, artists] = await Promise.all([
        getUserProfile(token!),
        getTopTracks(token!, timeRange),
        getTopArtists(token!, timeRange),
      ])
      setProfile(prof)
      setTopTracks(tracks.items || [])
      setTopArtists(artists.items || [])

      const g = extractGenres(artists.items || [])
      setGenres(g)

      if (tracks.items?.length) {
        const ids = tracks.items.slice(0, 10).map((t: any) => t.id)
        const features = await getAudioFeatures(token!, ids)
        const m = calculateMoodScore(features.audio_features || [])
        setMood(m)
        setPersonality(getMusicPersonality(g, m))
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const timeLabels = {
    short_term: '4 Weeks',
    medium_term: '6 Months',
    long_term: 'All Time',
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
        <p className="text-green-400 font-medium">Loading your stats...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg">SpotifyStats</span>
        </div>
        <div className="flex items-center gap-4">
          {profile?.images?.[0] && (
            <img src={profile.images[0].url} className="w-8 h-8 rounded-full" />
          )}
          <span className="text-gray-300 text-sm">{profile?.display_name}</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Personality Banner */}
        {personality && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 
                          border border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-green-400 text-sm mb-1">Your Music Personality</p>
            <h2 className="text-3xl font-bold text-white">{personality}</h2>
          </div>
        )}

        {/* Time Range Toggle */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit mx-auto">
          {(Object.keys(timeLabels) as TimeRange[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                timeRange === t
                  ? 'bg-green-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeLabels[t]}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-white/10">
          {['tracks', 'artists', 'genres', 'mood'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-3">
            {topTracks.map((track, i) => (
              <div key={track.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-gray-500 w-6 text-sm text-right">{i + 1}</span>
                {track.album?.images?.[0] && (
                  <img src={track.album.images[0].url} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-gray-400 text-sm truncate">
                    {track.artists?.map((a: any) => a.name).join(', ')}
                  </p>
                </div>
                <span className="text-gray-600 text-xs">{track.album?.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topArtists.map((artist, i) => (
              <div key={artist.id}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center">
                {artist.images?.[0] ? (
                  <img src={artist.images[0].url} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">🎤</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-xs">#{i + 1}</span>
                  <p className="font-medium text-sm">{artist.name}</p>
                  <p className="text-gray-500 text-xs capitalize">
                    {artist.genres?.[0] || 'Artist'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Genres Tab */}
        {activeTab === 'genres' && (
          <div className="space-y-3">
            {genres.map((g, i) => (
              <div key={g.genre} className="flex items-center gap-4">
                <span className="text-gray-500 w-6 text-sm">{i + 1}</span>
                <span className="text-white capitalize flex-1">{g.genre}</span>
                <div className="w-48 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(g.count / genres[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-gray-500 text-sm w-8">{g.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mood Tab */}
        {activeTab === 'mood' && mood && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Energy', value: mood.energy, color: 'bg-orange-500' },
              { label: 'Happiness', value: mood.valence, color: 'bg-yellow-500' },
              { label: 'Danceability', value: mood.danceability, color: 'bg-pink-500' },
              { label: 'Acousticness', value: mood.acousticness, color: 'bg-blue-500' },
              { label: 'Avg Tempo', value: null, raw: `${mood.tempo} BPM`, color: 'bg-purple-500' },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-3">{m.label}</p>
                {m.value !== null ? (
                  <>
                    <p className="text-3xl font-bold mb-2">{m.value}%</p>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.value}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-3xl font-bold">{m.raw}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}