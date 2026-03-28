'use client'

import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'

const PUBLIC_PATHS = ['/login', '/register']

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  // Redirect unauthenticated users to login (except on public pages)
  if (!user && !isPublicPage) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  // Don't show nav on public pages
  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <>
      <nav style={{
        background: '#1a365d',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
      }}>
        <strong style={{ fontSize: '1.2rem' }}>Retirement Companion</strong>
        <a href="/" style={{ color: '#bee3f8', textDecoration: 'none' }}>Dashboard</a>
        <a href="/countdown" style={{ color: '#bee3f8', textDecoration: 'none' }}>Countdown</a>
        <a href="/finances" style={{ color: '#bee3f8', textDecoration: 'none' }}>Finances</a>
        <a href="/checklist" style={{ color: '#bee3f8', textDecoration: 'none' }}>Checklist</a>
        <a href="/goals" style={{ color: '#bee3f8', textDecoration: 'none' }}>Goals</a>
        <a href="/coach" style={{ color: '#bee3f8', textDecoration: 'none', fontWeight: 500 }}>Coach</a>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/profile" style={{ fontSize: '0.875rem', color: '#bee3f8', textDecoration: 'none' }}>{user?.full_name}</a>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1px solid #bee3f8',
              color: '#bee3f8',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </>
  )
}
