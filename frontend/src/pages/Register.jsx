import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', country: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState ('')

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required. '
    if (!form.email.includes('@')) e.email = 'Enter a valid email. '
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (form.password !== form.password2) e.password2 = 'Passwords do not match.'
    if (!form.country.trim()) e.country = 'Country is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setErrors({})
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      setServerError(JSON.stringify(err.response?.data || 'Registration failed'))
    }
  }

  const input = (field) => ({padding: '10px 12px', border: `1px solid ${errors[field] ? 'red' : '#ccc'}`, borderRadius: '6px', fontSize: '1rem',})
  const btn = { padding: '10px', background: '#1a2b4a', color: '#fff', border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Create Account</h2>
      {serverError && <p style={{ color: 'red', fontSize: '.9rem' }}>{serverError}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {['username', 'email', 'country'].map((field) => (
          <div key={field}>
            <input placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
          style={input(field)} />
        {errors[field] && <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>{errors[field]}</p>}
      </div>
    ))}
    <div>
      <input placeholder="Password" type="password" value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })} style={input('password')} />
      {errors.password && <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>{errors.password}</p>}
    </div>
    <div>
      <input placeholder="Confirm Password" type="password" value={form.password2}
        onChange={e => setForm({ ...form, password2: e.target.value })} style={input('password2')} />
      {errors.password2 && <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>{errors.password2}</p>}
    </div>
        <button onClick={handleSubmit} style={btn}>Register</button>
      </div>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  )
}
