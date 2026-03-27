import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retirement Transition Companion',
  description: 'Plan and manage your transition into retirement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
          <a href="/finances" style={{ color: '#bee3f8', textDecoration: 'none' }}>Finances</a>
          <a href="/checklist" style={{ color: '#bee3f8', textDecoration: 'none' }}>Checklist</a>
          <a href="/goals" style={{ color: '#bee3f8', textDecoration: 'none' }}>Goals</a>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
