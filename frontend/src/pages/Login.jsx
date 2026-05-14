import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const input = (hasError) => ({
    padding: '10px 12px',
    border: `1px solid ${hasError ? 'red' : '#ccc'}`,
    borderRadius: '6px',
    fontSize: '1rem',
  })

  const btn = {
    padding: '10px', background: '#1a2b4a', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem',
  }

  const validate = () => {
    const e = {}
    if (!form.email.includes('@')) e.email = 'Enter a valid email.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setErrors({})
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch {
      setServerError('Invalid credentials. Please try again.')
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Sign In</h2>
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <input placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} style={input(errors.email)} />
          {errors.email && <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>{errors.email}</p>}
        </div>
        <div>
          <input placeholder="Password" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} style={input(errors.password)} />
          {errors.password && <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>{errors.password}</p>}
        </div>
        <button onClick={handleSubmit} style={btn}>Login</button>
      </div>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  )
}