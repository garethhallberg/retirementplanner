export default function Home() {
  return (
    <div>
      <h1>Welcome to Your Retirement Companion</h1>
      <p>Plan, prepare, and thrive in your retirement transition.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
      }}>
        <DashboardCard
          title="Financial Overview"
          description="Track your pensions, savings, and investments in one place."
          href="/finances"
        />
        <DashboardCard
          title="Retirement Countdown"
          description="See how long until the big day and what you need to do before then."
          href="/checklist"
        />
        <DashboardCard
          title="Bucket List"
          description="Set goals for travel, experiences, and new skills."
          href="/goals"
        />
      </div>
    </div>
  )
}

function DashboardCard({ title, description, href }: {
  title: string
  description: string
  href: string
}) {
  return (
    <a href={href} style={{
      display: 'block',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'box-shadow 0.2s',
    }}>
      <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>{title}</h2>
      <p style={{ margin: 0, color: '#4a5568' }}>{description}</p>
    </a>
  )
}
