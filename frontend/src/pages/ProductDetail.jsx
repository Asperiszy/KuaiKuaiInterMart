import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsApi } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.detail(id)
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>
  if (!product) return <p style={{ padding: 24 }}>Product not found.</p>

  return (
    <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
            : <div style={{ background: '#f0f0f0', height: '300px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                No image
              </div>}
        </div>
        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <p style={{ color: '#555' }}>{product.description}</p>
          <p><strong>Base Price:</strong> ${product.base_price_usd} USD</p>
          <p><strong>Origin:</strong> {product.origin_country || '—'}</p>
          <p><strong>Stock:</strong> {product.stock} units</p>
          {product.avg_rating && <p>⭐ {product.avg_rating} / 5</p>}
        </div>
      </div>

      {/* Regional Price Comparison */}
      {product.regional_prices?.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2>Price Comparison by Region</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a2b4a', color: '#fff' }}>
                <th style={th}>Region</th>
                <th style={th}>Currency</th>
                <th style={th}>Price</th>
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

      {/* Reviews */}
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
