'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithSpotify, getToken } from '@/lib/spotify-auth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (getToken()) router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg">SpotifyStats</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

          {/* Badge */}
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 
                          text-sm px-4 py-1.5 rounded-full">
            Your music. Your story.
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Discover Your{' '}
            <span className="text-green-500">Music</span>{' '}
            Personality
          </h1>

          {/* Subheadline */}
          <p className="text-gray-400 text-lg md:text-xl max-w-lg">
            Deep analytics for your Spotify history — top artists, tracks,
            listening patterns, genre breakdowns, and personality insights.
          </p>

          {/* CTA Button */}
          <button
            onClick={loginWithSpotify}
            className="flex items-center gap-3 bg-green-500 hover:bg-green-400 
                       text-black font-bold px-8 py-4 rounded-full text-lg 
                       transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 
                       0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36
                       -2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18
                       -.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301
                       1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58
                       -11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141
                       C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36
                       C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18
                       -.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719
                       1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </button>

          <p className="text-gray-600 text-sm">
            We only read your listening data. We never modify anything.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              '🎵 Top Tracks',
              '🎤 Top Artists',
              '🎸 Genre Analysis',
              '🕐 Listening Heatmap',
              '😊 Mood Score',
              '🃏 Personality Card',
            ].map(f => (
              <span key={f} className="bg-white/5 border border-white/10 
                                       text-gray-300 text-sm px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm">
        Not affiliated with Spotify AB
      </footer>
    </div>
  )
}