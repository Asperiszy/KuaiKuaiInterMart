import { useState, useEffect } from 'react'
import { authApi } from '../services/api'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    authApi.getProfile()
      .then(res => {
        setUser(res.data)
        setForm(res.data)
      })
      .catch(() => setError('Failed to load profile.'))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      const res = await authApi.updateProfile(form)
      setUser(res.data)
      setEditing(false)
      setMessage('Profile updated successfully!')
    } catch {
      setError('Failed to update profile.')
    }
  }

  if (!user) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h2>My Profile</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '12px' }}>
        <label>Username</label>
        <input
          name="username"
          value={form.username || ''}
          onChange={handleChange}
          disabled={!editing}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Email</label>
        <input
          name="email"
          value={form.email || ''}
          onChange={handleChange}
          disabled={!editing}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Country</label>
        <input
          name="country"
          value={form.country || ''}
          onChange={handleChange}
          disabled={!editing}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Phone</label>
        <input
          name="phone"
          value={form.phone || ''}
          onChange={handleChange}
          disabled={!editing}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        />
      </div>

      {editing ? (
        <div>
          <button onClick={handleSave} style={{ marginRight: '10px' }}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      )}
    </div>
  )
}