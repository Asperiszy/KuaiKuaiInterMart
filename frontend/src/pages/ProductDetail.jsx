import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const fetchProduct = () => {
    setLoading(true)
    setError(null)
    productsApi.detail(id)
      .then(({ data }) => setProduct(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('This product does not exist or has been removed.')
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again in a moment.')
        } else if (!navigator.onLine) {
          setError('You appear to be offline. Please check your internet connection.')
        } else {
          setError('Failed to load product. Make sure the backend server is running.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProduct() }, [id])

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existing = cart.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        cart.push({ id: product.id, name: product.name,
                    price: parseFloat(product.base_price_usd), quantity })
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      alert('Failed to add to cart. Please try again.')
    }
  }

  if (loading) return <LoadingSpinner message="Loading product…" />
  if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />

  return (
    <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          {(product.image_url || product.image)
            ? <img src={product.image_url || product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
            : <div style={{ background: '#f0f0f0', height: '300px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#aaa', fontSize: '3rem' }}>🛍️</div>}
        </div>

        <div>
          <h1 style={{ marginTop: 0, fontSize: '1.4rem' }}>{product.name}</h1>
          <p style={{ color: '#555', fontSize: '.95rem' }}>{product.description}</p>
          <p><strong>Origin:</strong> {product.origin_country || '—'}</p>
          <p><strong>Stock:</strong> {product.stock > 0
            ? `${product.stock} units`
            : <span style={{ color: '#e53935' }}>Out of stock</span>}
          </p>
          {product.avg_rating && <p>⭐ {product.avg_rating} / 5</p>}

          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2b4a', margin: '16px 0 8px' }}>
            ${parseFloat(product.base_price_usd).toFixed(2)} USD
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold' }}>Qty:</label>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={qBtn}>−</button>
            <span style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={qBtn}>+</button>
          </div>

          {product.stock > 0 ? (
            <button onClick={addToCart} style={{
              width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 'bold',
              background: added ? '#4caf50' : '#1a2b4a', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background .3s'
            }}>
              {added ? '✅ Added to Cart!' : '🛒 Add to Cart'}
            </button>
          ) : (
            <button disabled style={{
              width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 'bold',
              background: '#ccc', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed'
            }}>Out of Stock</button>
          )}

          {added && (
            <button onClick={() => navigate('/cart')} style={{
              width: '100%', marginTop: '10px', padding: '12px',
              background: 'none', border: '2px solid #1a2b4a', color: '#1a2b4a',
              borderRadius: '8px', cursor: 'pointer', fontSize: '1rem'
            }}>Go to Cart →</button>
          )}
        </div>
      </div>

      {product.regional_prices?.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2>Price Comparison by Region</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a2b4a', color: '#fff' }}>
                <th style={th}>Region</th><th style={th}>Currency</th><th style={th}>Price</th>
              </tr>
            </thead>
            <tbody>
              {product.regional_prices.map((rp) => (
                <tr key={rp.region} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{rp.region}</td>
                  <td style={td}>{rp.currency}</td>
                  <td style={td}>{rp.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {product.reviews?.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2>Customer Reviews</h2>
          {product.reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
              <strong>{r.username}</strong> — {'⭐'.repeat(r.rating)}
              <p style={{ margin: '4px 0', color: '#555' }}>{r.comment}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

const th = { padding: '10px 16px', textAlign: 'left' }
const td = { padding: '10px 16px' }
const qBtn = { width: '32px', height: '32px', fontSize: '1.2rem',
               background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }
