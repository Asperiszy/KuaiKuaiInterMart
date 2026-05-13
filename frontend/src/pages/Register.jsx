import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', country: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Registration failed'))
    }
  }

  const input = { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }
  const btn = { padding: '10px', background: '#1a2b4a', color: '#fff', border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Create Account</h2>
      {error && <p style={{ color: 'red', fontSize: '.9rem' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {['username', 'email', 'country'].map((field) => (
          <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={input} />
        ))}
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} style={input} />
        <input placeholder="Confirm Password" type="password" value={form.password2}
          onChange={e => setForm({ ...form, password2: e.target.value })} style={input} />
        <button onClick={handleSubmit} style={btn}>Register</button>
      </div>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  )
}
