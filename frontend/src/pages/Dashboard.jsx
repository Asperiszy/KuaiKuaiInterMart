import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productsApi } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.list({ page_size: 10 }),
      productsApi.categories(),
    ])
      .then(([productsRes, categoriesRes]) => {
        setFeatured(productsRes.data.results ?? productsRes.data)
        setCategories(categoriesRes.data.results ?? categoriesRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>

      {/* ── Personalized hero banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2b4a 0%, #2d4a7a 100%)',
        color: '#fff', padding: '48px 24px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px' }}>
          Welcome back, {user?.username}! 👋
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.85, margin: '0 0 20px' }}>
          Preferred currency: <strong>{user?.preferred_currency || 'USD'}</strong>
          {user?.country && <> · Shipping to <strong>{user.country}</strong></>}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" style={{
            padding: '12px 32px', background: '#f0c040', color: '#1a2b4a',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
          }}>
            🛍️ Shop Products
          </Link>
          <Link to="/orders" style={{
            padding: '12px 32px', background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
          }}>
            📦 My Orders
          </Link>
          <Link to="/cart" style={{
            padding: '12px 32px', background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
          }}>
            🛒 Cart
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Shop by Category ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#1a2b4a', marginBottom: '16px' }}>Shop by Category</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {categories.slice(0, 8).map((cat) => (
              <button key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                style={{
                  padding: '12px 24px', background: '#fff',
                  border: '1px solid #ddd', borderRadius: '24px',
                  cursor: 'pointer', fontSize: '.95rem', color: '#1a2b4a',
                  fontWeight: '500', transition: 'all .2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1a2b4a'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = '#1a2b4a'
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#1a2b4a', margin: 0 }}>Recommended for You</h2>
            <Link to="/products" style={{ color: '#1a2b4a', fontSize: '.95rem' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#888', padding: '40px', textAlign: 'center' }}>Loading…</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {featured.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                    padding: '16px', height: '100%', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow .2s, transform .2s', cursor: 'pointer'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name}
                        style={{ width: '100%', height: '140px', objectFit: 'contain',
                                 borderRadius: '6px', marginBottom: '12px', background: '#fff' }} />
                    ) : (
                      <div style={{ background: '#f0f4ff', borderRadius: '6px', height: '140px',
                                    marginBottom: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '2rem' }}>🛍️</div>
                    )}
                    <p style={{
                      margin: '0 0 6px', fontWeight: '600', fontSize: '.9rem',
                      color: '#1a2b4a', lineHeight: '1.3',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{p.name}</p>
                    <p style={{ margin: 'auto 0 0', fontWeight: 'bold',
                                color: '#1a2b4a', fontSize: '1.05rem' }}>
                      ${parseFloat(p.base_price_usd).toFixed(2)} USD
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  )
}
