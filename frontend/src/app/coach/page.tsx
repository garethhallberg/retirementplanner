'use client'

import { useEffect, useState, useRef, FormEvent, KeyboardEvent } from 'react'
import { api } from '@/lib/api'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

interface ConversationDetail extends Conversation {
  messages: ChatMessage[]
}

export default function CoachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const data = await api.get<Conversation[]>('/api/chat/conversations')
      setConversations(data)
    } catch {
      // handled by api client
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const data = await api.get<ConversationDetail>(`/api/chat/conversations/${id}`)
      setActiveConversation(data)
      setMessages(data.messages)
      setError(null)
    } catch {
      setError('Failed to load conversation')
    }
  }

  const startNewConversation = () => {
    setActiveConversation(null)
    setMessages([])
    setError(null)
    setInput('')
    textareaRef.current?.focus()
  }

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setError(null)
    setInput('')

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setIsLoading(true)

    try {
      const response = await api.post<ChatMessage>('/api/chat/', {
        message: trimmed,
        conversation_id: activeConversation?.id || null,
      })

      // Replace temp message with real ones and add assistant response
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id)
        return [
          ...withoutTemp,
          { ...tempUserMsg, id: 'user-' + response.id },
          response,
        ]
      })

      // Refresh conversation list and set active conversation
      await fetchConversations()
      if (!activeConversation) {
        // Reload to get the conversation ID for subsequent messages
        const convos = await api.get<Conversation[]>('/api/chat/conversations')
        setConversations(convos)
        if (convos.length > 0) {
          const latest = convos[0]
          const detail = await api.get<ConversationDetail>(`/api/chat/conversations/${latest.id}`)
          setActiveConversation(detail)
          setMessages(detail.messages)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', margin: '-2rem' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={sidebarStyle}>
          <button onClick={startNewConversation} style={newChatButtonStyle}>
            + New Conversation
          </button>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  ...conversationItemStyle,
                  background: activeConversation?.id === conv.id ? '#edf2f7' : 'transparent',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#2d3748' }}>
                  {conv.title || 'New conversation'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                  {new Date(conv.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#a0aec0', padding: '1rem', textAlign: 'center' }}>
                No conversations yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Header */}
        <div style={chatHeaderStyle}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#4a5568' }}
          >
            {sidebarOpen ? '\u2190' : '\u2192'}
          </button>
          <span style={{ fontWeight: 600, color: '#1a365d' }}>
            {activeConversation?.title || 'Retirement Coach'}
          </span>
        </div>

        {/* Messages */}
        <div style={messagesContainerStyle}>
          {messages.length === 0 && !isLoading && (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome!</div>
              <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>I&apos;m your Retirement Coach</h2>
              <p style={{ color: '#4a5568', maxWidth: '500px', lineHeight: 1.6 }}>
                Ask me anything about planning your retirement. Whether it&apos;s finances, lifestyle,
                bucket list ideas, or how to make the most of your go-go years &mdash; I&apos;m here to help.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                    style={starterPromptStyle}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  ...(msg.role === 'user' ? userBubbleStyle : assistantBubbleStyle),
                  maxWidth: '70%',
                }}
              >
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ ...assistantBubbleStyle, color: '#a0aec0', fontStyle: 'italic' }}>
                Coach is thinking...
              </div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={inputAreaStyle}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your retirement coach anything..."
              rows={1}
              style={textareaStyle}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                ...sendButtonStyle,
                opacity: isLoading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.5rem', textAlign: 'center' }}>
            Coach gives general guidance, not regulated financial advice. Always consult a professional for financial decisions.
          </p>
        </div>
      </div>
    </div>
  )
}

const STARTER_PROMPTS = [
  'What should I be doing to prepare for retirement?',
  'Explain go-go, slow-go, and no-go years',
  'Help me think about my retirement bucket list',
  'How do I make the most of my pension?',
]

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  borderRight: '1px solid #e2e8f0',
  background: '#f7fafc',
  display: 'flex',
  flexDirection: 'column',
}

const newChatButtonStyle: React.CSSProperties = {
  margin: '1rem',
  padding: '0.625rem 1rem',
  background: '#1a365d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
}

const conversationItemStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  borderBottom: '1px solid #edf2f7',
}

const chatHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #e2e8f0',
  background: '#f7fafc',
}

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
}

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  padding: '2rem',
}

const userBubbleStyle: React.CSSProperties = {
  background: '#1a365d',
  color: 'white',
  padding: '0.75rem 1rem',
  borderRadius: '12px 12px 2px 12px',
  lineHeight: 1.5,
  fontSize: '0.9375rem',
}

const assistantBubbleStyle: React.CSSProperties = {
  background: '#f0f4f8',
  color: '#2d3748',
  padding: '0.75rem 1rem',
  borderRadius: '12px 12px 12px 2px',
  lineHeight: 1.5,
  fontSize: '0.9375rem',
}

const starterPromptStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: '1px solid #cbd5e0',
  borderRadius: '9999px',
  background: 'white',
  color: '#4a5568',
  cursor: 'pointer',
  fontSize: '0.8125rem',
}

const inputAreaStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid #e2e8f0',
  background: '#f7fafc',
}

const textareaStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.625rem 0.875rem',
  border: '1px solid #cbd5e0',
  borderRadius: '8px',
  fontSize: '0.9375rem',
  resize: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.5,
  minHeight: '42px',
  maxHeight: '120px',
}

const sendButtonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  background: '#1a365d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
}
