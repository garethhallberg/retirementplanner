'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [retirementDate, setRetirementDate] = useState(user?.retirement_date ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await api.patch(`/api/users/${user?.id}`, {
        retirement_date: retirementDate || null,
      })
      await refreshUser()
      setMessage('Profile updated.')
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', color: '#1a365d', marginBottom: '1.5rem' }}>
        Profile Settings
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#4a5568' }}>
            Full Name
          </label>
          <p style={{ color: '#1a365d' }}>{user?.full_name}</p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#4a5568' }}>
            Email
          </label>
          <p style={{ color: '#1a365d' }}>{user?.email}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="retirement-date"
            style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#4a5568' }}
          >
            Retirement Date
          </label>
          <input
            id="retirement-date"
            type="date"
            value={retirementDate}
            onChange={(e) => setRetirementDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#1a365d',
            color: 'white',
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        {message && (
          <p style={{
            marginTop: '1rem',
            color: message.startsWith('Error') ? '#e53e3e' : '#38a169',
          }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
