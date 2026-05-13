import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} style={input} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} style={input} />
        <button onClick={handleSubmit} style={btn}>Login</button>
      </div>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  )
}

const input = { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }
const btn = { padding: '10px', background: '#1a2b4a', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }
