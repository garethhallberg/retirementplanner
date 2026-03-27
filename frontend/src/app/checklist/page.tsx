'use client'

export default function ChecklistPage() {
  return (
    <div>
      <h1>Pre-Retirement Checklist</h1>
      <p>Keep track of everything you need to sort before the big day.</p>

      <div style={{ marginTop: '1.5rem' }}>
        {['Financial', 'Legal', 'Healthcare', 'Lifestyle'].map((category) => (
          <div key={category} style={{ marginBottom: '1.5rem' }}>
            <h2>{category}</h2>
            <p style={{ color: '#718096' }}>
              Connect to the API to see your {category.toLowerCase()} tasks here.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
