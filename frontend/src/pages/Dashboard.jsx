import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <main style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome back, {user?.username}!</h1>
      <p style={{ color: '#555' }}>Preferred currency: <strong>{user?.preferred_currency}</strong></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'Browse Products', to: '/products', icon: '🛍️' },
          { label: 'My Orders', to: '/orders', icon: '📦' },
          { label: 'Cart', to: '/cart', icon: '🛒' },
        ].map((card) => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px',
                          textAlign: 'center', transition: 'box-shadow .2s' }}
                 onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ fontSize: '2rem' }}>{card.icon}</div>
              <p style={{ marginTop: 8, color: '#1a2b4a', fontWeight: 'bold' }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
