import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) { setError('Please enter your email.'); return }
    if (!form.password) { setError('Please enter your password.'); return }

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid email or password. Please try again.')
      } else if (!navigator.onLine) {
        setError('You appear to be offline.')
      } else {
        setError('Login failed. Make sure the backend server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Sign In</h2>

      {error && (
        <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px',
                      padding: '10px 14px', color: '#c62828', marginBottom: '16px', fontSize: '.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e =>{ setForm({ ...form, email: e.target.value }); setError('') }} style={inputStyle} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e =>{ setForm({ ...form, password: e.target.value }); setError('')}} style={inputStyle} />

        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '12px', background: loading ? '#aaa' : '#1a2b4a', color: '#fff',
          border: 'none', borderRadius: '6px', fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          {loading && (
            <span style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTop: '2px solid #fff',
              borderRadius: '50%', display: 'inline-block',
              animation: 'spin 0.8s linear infinite'
            }} />
          )}
          {loading ? 'Signing in…' : 'Login'}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  )
}

const inputStyle = { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }
