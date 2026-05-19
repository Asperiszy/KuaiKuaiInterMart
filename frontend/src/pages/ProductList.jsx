import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../services/api'

//Simple in-memory cache

//persists while the brwoser tab is open - prevents redudnacy API calls
const cache = {}

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [nextPage, setNextPage] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Initial load or search
  useEffect(() => {
    const cacheKey = `products_${search}`
 
    // Return cached data instantly if available
    if (cache[cacheKey]) {
      setProducts(cache[cacheKey].results)
      setNextPage(cache[cacheKey].next)
      setTotal(cache[cacheKey].count)
      setLoading(false)
      return
    }
 
    setLoading(true)
    productsApi.list({ search, page_size: 50 })
      .then(({ data }) => {
        // Save to cache
        cache[cacheKey] = {
          results: data.results ?? data,
          next: data.next ?? null,
          count: data.count ?? (data.results ?? data).length,
        }
        setProducts(cache[cacheKey].results)
        setNextPage(cache[cacheKey].next)
        setTotal(cache[cacheKey].count)
      })
      .finally(() => setLoading(false))
  }, [search])

  // Load more (next page)
  const loadMore = () => {
    if (!nextPage) return
    setLoadingMore(true)
    productsApi.list({ search, page_size: 50, page: new URL(nextPage).searchParams.get('page') })
      .then(({ data }) => {
        setProducts(prev => [...prev, ...(data.results ?? data)])
        setNextPage(data.next ?? null)
      })
      .finally(() => setLoadingMore(false))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1a2b4a' }}>Products</h1>
            {!loading && (
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: '.9rem' }}>
                Showing {products.length} of {total} products
              </p>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch}
            style={{ display: 'flex', gap: '8px' }}>
            <input
              placeholder="Search products…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ padding: '10px 14px', width: '260px', border: '1px solid #ddd',
                       borderRadius: '8px', fontSize: '.95rem', outline: 'none' }}
            />
            <button type="submit" style={{
              padding: '10px 20px', background: '#1a2b4a', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '.95rem'
            }}>
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
                style={{ padding: '10px 14px', background: '#eee', border: 'none',
                         borderRadius: '8px', cursor: 'pointer', fontSize: '.95rem' }}>
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading products…
          </div>
        )}

        {/* No results */}
        {!loading && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
            No products found for "{search}"
          </div>
        )}

        {/* Product grid */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {products.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                  padding: '16px', height: '100%', boxSizing: 'border-box',
                  transition: 'box-shadow .2s, transform .2s', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>

                  {/* Image placeholder */}
                  <div style={{ background: '#f0f4ff', borderRadius: '6px',
                                height: '120px', marginBottom: '12px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '2rem' }}>
                    🛍️
                  </div>

                  {/* Product info */}
                  <div>
                    <p style={{ margin: '0 0 6px', fontWeight: '600', fontSize: '.9rem',
                                color: '#1a2b4a', lineHeight: '1.3',
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.name}
                    </p>
                    <p style={{ margin: '0 0 8px', color: '#aaa', fontSize: '.8rem' }}>
                      {p.origin_country || 'USA'}
                    </p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#1a2b4a', fontSize: '1rem' }}>
                      ${parseFloat(p.base_price_usd).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more button */}
        {nextPage && !loading && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button onClick={loadMore} disabled={loadingMore}
              style={{ padding: '12px 40px', background: '#1a2b4a', color: '#fff',
                       border: 'none', borderRadius: '8px', cursor: loadingMore ? 'not-allowed' : 'pointer',
                       fontSize: '1rem', opacity: loadingMore ? 0.7 : 1 }}>
              {loadingMore ? 'Loading…' : `Load More (${total - products.length} remaining)`}
            </button>
          </div>
        )}

        {/* Bottom padding */}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  )
}