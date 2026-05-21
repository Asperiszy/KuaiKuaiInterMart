import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', country: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!form.username.trim()) { setFieldErrors({ username: 'Username is required.' }); return }
    if (!form.email.trim()) { setFieldErrors({ email: 'Email is required.' }); return }
    if (!form.password) { setFieldErrors({ password: 'Password is required.' }); return }
    if (form.password.length < 8) { setFieldErrors({ password: 'Password must be at least 8 characters.' }); return }
    if (form.password !== form.password2) { setFieldErrors({ password2: 'Passwords do not match.' }); return }

    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      if (err.response?.status === 400) {
        const data = err.response.data
        if (typeof data === 'object') setFieldErrors(data)
        else setError('Registration failed. Please check your details.')
      } else if (!navigator.onLine) {
        setError('You appear to be offline.')
      } else {
        setError('Registration failed. Make sure the backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' },
    { key: 'password2', label: 'Confirm Password', type: 'password' },
  ]

  return (
    <main style={{ maxWidth: '400px', margin: '60px auto', padding: '32px',
                   border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Create Account</h2>

      {error && (
        <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px',
                      padding: '10px 14px', color: '#c62828', marginBottom: '16px', fontSize: '.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <input placeholder={label} type={type} value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              style={{ ...inputStyle, borderColor: fieldErrors[key] ? '#e53935' : '#ccc' }} />
            {fieldErrors[key] && (
              <p style={{ color: '#e53935', fontSize: '.8rem', margin: '4px 0 0' }}>
                {Array.isArray(fieldErrors[key]) ? fieldErrors[key][0] : fieldErrors[key]}
              </p>
            )}
          </div>
        ))}

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
          {loading ? 'Registering…' : 'Register'}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ccc',
  borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
}
