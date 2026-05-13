import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../services/api'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.list({ search })
      .then(({ data }) => setProducts(data.results ?? data))
      .finally(() => setLoading(false))
  }, [search])

  if (loading) return <p style={{ padding: 24 }}>Loading products…</p>

  return (
    <main style={{ padding: '24px' }}>
      <h2>Products</h2>
      <input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '8px 12px', width: '300px', marginBottom: '24px',
                 border: '1px solid #ccc', borderRadius: '6px' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px',
                          transition: 'box-shadow .2s' }}
                 onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: '4px' }} />}
              <h3 style={{ marginTop: 8 }}>{p.name}</h3>
              <p style={{ color: '#888', fontSize: '.85rem' }}>{p.origin_country}</p>
              <p style={{ fontWeight: 'bold', color: '#1a2b4a' }}>${p.base_price_usd} USD</p>
            </div>
          </Link>
        ))}
        {products.length === 0 && <p>No products found.</p>}
      </div>
    </main>
  )
}
