import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import CountdownPage from '../page'

// Mock the api module — no longer uses useAuth
const mockGet = jest.fn()
jest.mock('@/lib/api', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}))

// Freeze time so calcTimeLeft gives deterministic results
const FROZEN_NOW = new Date('2026-03-27T12:00:00').getTime()

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(FROZEN_NOW)
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

describe('CountdownPage', () => {
  it('shows days, hours, minutes, seconds for a future retirement date', async () => {
    mockGet.mockResolvedValue({
      retirement_date: '2027-06-15',
      days_remaining: 445,
      is_retired: false,
      message: 'About 1 year to go — plenty of time to plan.',
    })

    render(<CountdownPage />)

    await waitFor(() => {
      // days unit label is visible
      expect(screen.getByText('days')).toBeInTheDocument()
      expect(screen.getByText('hours')).toBeInTheDocument()
      expect(screen.getByText('minutes')).toBeInTheDocument()
      expect(screen.getByText('seconds')).toBeInTheDocument()
    })
  })

  it('counts down each second', async () => {
    mockGet.mockResolvedValue({
      retirement_date: '2027-06-15',
      days_remaining: 445,
      is_retired: false,
      message: 'About 1 year to go — plenty of time to plan.',
    })

    render(<CountdownPage />)
    await waitFor(() => expect(screen.getByText('seconds')).toBeInTheDocument())

    const secondsBefore = screen.getByText('seconds').previousSibling?.textContent

    act(() => { jest.advanceTimersByTime(1000) })

    const secondsAfter = screen.getByText('seconds').previousSibling?.textContent

    // The seconds value should have changed
    expect(secondsBefore).not.toEqual(secondsAfter)
  })

  it('shows retired state when retirement date has passed', async () => {
    mockGet.mockResolvedValue({
      retirement_date: '2025-01-01',
      days_remaining: 0,
      is_retired: true,
      message: "Congratulations — you're retired!",
    })

    render(<CountdownPage />)

    await waitFor(() => {
      expect(screen.getByText("You're retired!")).toBeInTheDocument()
    })
  })

  it('shows message and profile link when no retirement date is set', async () => {
    mockGet.mockResolvedValue({
      retirement_date: null,
      days_remaining: null,
      is_retired: false,
      message: 'No retirement date set. Update your profile to start the countdown.',
    })

    render(<CountdownPage />)

    await waitFor(() => {
      expect(screen.getByText(/no retirement date set/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /profile settings/i })).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    render(<CountdownPage />)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {})) // never resolves
    render(<CountdownPage />)
    expect(screen.getByText('Loading countdown...')).toBeInTheDocument()
  })
})
