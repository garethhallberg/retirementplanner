'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface CountdownData {
  retirement_date: string | null
  days_remaining: number | null
  is_retired: boolean
  message: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isRetired: boolean
}

function calcTimeLeft(retirementDate: string): TimeLeft {
  // Treat the date string as midnight on that day in local time
  const target = new Date(retirementDate + 'T00:00:00')
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isRetired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isRetired: false,
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownPage() {
  const [data, setData] = useState<CountdownData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    api.get<CountdownData>('/api/countdown/')
      .then((d) => {
        setData(d)
        if (d.retirement_date) {
          setTimeLeft(calcTimeLeft(d.retirement_date))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data?.retirement_date) return
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(data.retirement_date!))
    }, 1000)
    return () => clearInterval(interval)
  }, [data?.retirement_date])

  if (loading) return <p>Loading countdown...</p>
  if (error) return <p style={{ color: '#e53e3e' }}>Error: {error}</p>
  if (!data) return null

  if (!data.retirement_date) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a365d' }}>Retirement Countdown</h1>
        <p style={{ color: '#4a5568', marginTop: '1rem' }}>{data.message}</p>
        <p style={{ color: '#718096', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          You can set your retirement date in your <a href="/profile" style={{ color: '#4299e1' }}>profile settings</a>.
        </p>
      </div>
    )
  }

  const isRetired = timeLeft?.isRetired ?? data.is_retired

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: '#1a365d', marginBottom: '2rem' }}>
        Retirement Countdown
      </h1>

      <div style={{
        background: isRetired ? '#f0fff4' : '#ebf8ff',
        border: `2px solid ${isRetired ? '#48bb78' : '#4299e1'}`,
        borderRadius: '12px',
        padding: '2.5rem',
        marginBottom: '1.5rem',
      }}>
        {isRetired ? (
          <>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <div style={{ fontSize: '1.5rem', color: '#276749', marginTop: '0.5rem', fontWeight: 'bold' }}>
              You're retired!
            </div>
          </>
        ) : timeLeft ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
          }}>
            {[
              { value: timeLeft.days, label: timeLeft.days === 1 ? 'day' : 'days' },
              { value: timeLeft.hours, label: timeLeft.hours === 1 ? 'hour' : 'hours' },
              { value: timeLeft.minutes, label: timeLeft.minutes === 1 ? 'minute' : 'minutes' },
              { value: timeLeft.seconds, label: timeLeft.seconds === 1 ? 'second' : 'seconds' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#1a365d',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {label === 'days' ? value : pad(value)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>{data.message}</p>

      <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginTop: '1rem' }}>
        Retirement date: {new Date(data.retirement_date + 'T00:00:00').toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}
