import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { AppShell } from './app-shell'

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
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
