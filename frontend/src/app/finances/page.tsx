'use client'

export default function FinancesPage() {
  return (
    <div>
      <h1>Financial Planning Dashboard</h1>
      <p>Track your pensions, ISAs, savings, and investments.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
      }}>
        <SummaryCard label="Total Assets" value="--" />
        <SummaryCard label="Total Liabilities" value="--" />
        <SummaryCard label="Net Worth" value="--" />
      </div>

      <h2 style={{ marginTop: '2rem' }}>Accounts</h2>
      <p style={{ color: '#718096' }}>
        Connect to the API to see your linked accounts here.
      </p>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '1.5rem',
      background: '#f7fafc',
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.875rem', color: '#718096' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a365d' }}>{value}</div>
    </div>
  )
}
