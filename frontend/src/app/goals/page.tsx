'use client'

export default function GoalsPage() {
  return (
    <div>
      <h1>Bucket List &amp; Goals</h1>
      <p>What do you want to do with your retirement? Set goals for travel, experiences, learning, and more.</p>

      <div style={{ marginTop: '1.5rem' }}>
        {['Travel', 'Experience', 'Learning', 'Health', 'Social'].map((category) => (
          <div key={category} style={{ marginBottom: '1.5rem' }}>
            <h2>{category}</h2>
            <p style={{ color: '#718096' }}>
              Connect to the API to see your {category.toLowerCase()} goals here.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
