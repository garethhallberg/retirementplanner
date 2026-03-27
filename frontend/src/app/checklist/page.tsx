'use client'

import { useEffect, useState, FormEvent } from 'react'
import { api } from '@/lib/api'

interface ChecklistItem {
  id: string
  title: string
  description: string | null
  category: string
  is_completed: boolean
  due_date: string | null
  sort_order: number
  created_at: string
}

const CATEGORIES = ['financial', 'legal', 'healthcare', 'lifestyle']

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('financial')
  const [submitting, setSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      const path = filterCategory
        ? `/api/checklist/?category=${filterCategory}`
        : '/api/checklist/'
      const data = await api.get<ChecklistItem[]>(path)
      setItems(data)
    } catch {
      // handled by api client (redirects on 401)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [filterCategory])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/checklist/', { title, description: description || null, category })
      setTitle('')
      setDescription('')
      setShowForm(false)
      await fetchItems()
    } catch {
      // error handling could be improved
    } finally {
      setSubmitting(false)
    }
  }

  const toggleComplete = async (item: ChecklistItem) => {
    await api.patch(`/api/checklist/${item.id}`, { is_completed: !item.is_completed })
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    await api.delete(`/api/checklist/${id}`)
    await fetchItems()
  }

  if (loading) return <p>Loading checklist...</p>

  const grouped = CATEGORIES.reduce<Record<string, ChecklistItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Pre-Retirement Checklist</h1>
          <p style={{ margin: 0, color: '#4a5568' }}>
            Keep track of everything you need to sort before the big day.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={primaryButtonStyle}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={formStyle}>
          <input
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? 'Adding...' : 'Add to Checklist'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0' }}>
        <FilterButton label="All" active={filterCategory === null} onClick={() => setFilterCategory(null)} />
        {CATEGORIES.map((c) => (
          <FilterButton
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            active={filterCategory === c}
            onClick={() => setFilterCategory(c)}
          />
        ))}
      </div>

      {filterCategory ? (
        <CategorySection
          category={filterCategory}
          items={items}
          onToggle={toggleComplete}
          onDelete={deleteItem}
        />
      ) : (
        CATEGORIES.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            items={grouped[cat]}
            onToggle={toggleComplete}
            onDelete={deleteItem}
          />
        ))
      )}

      {items.length === 0 && (
        <p style={{ color: '#718096', textAlign: 'center', marginTop: '3rem' }}>
          No items yet. Add your first checklist item to get started.
        </p>
      )}
    </div>
  )
}

function CategorySection({
  category,
  items,
  onToggle,
  onDelete,
}: {
  category: string
  items: ChecklistItem[]
  onToggle: (item: ChecklistItem) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#1a365d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h2>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderBottom: '1px solid #edf2f7',
          }}
        >
          <input
            type="checkbox"
            checked={item.is_completed}
            onChange={() => onToggle(item)}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              textDecoration: item.is_completed ? 'line-through' : 'none',
              color: item.is_completed ? '#a0aec0' : '#2d3748',
              fontWeight: 500,
            }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
                {item.description}
              </div>
            )}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e53e3e',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        border: '1px solid #cbd5e0',
        background: active ? '#1a365d' : 'white',
        color: active ? 'white' : '#4a5568',
        cursor: 'pointer',
        fontSize: '0.875rem',
      }}
    >
      {label}
    </button>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#1a365d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem',
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  marginTop: '1.5rem',
  padding: '1.5rem',
  background: '#f7fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  border: '1px solid #cbd5e0',
  borderRadius: '4px',
  fontSize: '1rem',
}
