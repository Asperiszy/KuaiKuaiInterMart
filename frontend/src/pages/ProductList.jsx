import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsApi } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'
import { ProductCardSkeleton } from '../components/SkeletonCard'

const cache = {}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Category from URL (?category=4) so Home page links work
  const selectedCategory = searchParams.get('category') || ''

  // Load categories once
  useEffect(() => {
    productsApi.categories()
      .then(({ data }) => setCategories(data.results ?? data))
      .catch(() => {})
  }, [])

  const fetchProducts = (searchTerm, category) => {
    const cacheKey = `products_${searchTerm}_${category}`
    if (cache[cacheKey]) {
      setProducts(cache[cacheKey].results)
      setNextPage(cache[cacheKey].next)
      setTotal(cache[cacheKey].count)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const params = { search: searchTerm, page_size: 50 }
    if (category) params.category = category

    productsApi.list(params)
      .then(({ data }) => {
        cache[cacheKey] = {
          results: data.results ?? data,
          next: data.next ?? null,
          count: data.count ?? (data.results ?? data).length,
        }
        setProducts(cache[cacheKey].results)
        setNextPage(cache[cacheKey].next)
        setTotal(cache[cacheKey].count)
      })
      .catch((err) => {
        if (err.response?.status === 500) {
          setError('Server error. Please try again.')
        } else if (!navigator.onLine) {
          setError('You appear to be offline.')
        } else {
          setError('Failed to load products. Make sure the backend is running.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts(search, selectedCategory)
  }, [search, selectedCategory])

  const selectCategory = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  const loadMore = () => {
    if (!nextPage) return
    setLoadingMore(true)
    const params = { search, page_size: 50, page: new URL(nextPage).searchParams.get('page') }
    if (selectedCategory) params.category = selectedCategory
    productsApi.list(params)
      .then(({ data }) => {
        setProducts(prev => [...prev, ...(data.results ?? data)])
        setNextPage(data.next ?? null)
      })
      .catch(() => setError('Failed to load more products.'))
      .finally(() => setLoadingMore(false))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const currentCategoryName = categories.find(c => String(c.id) === selectedCategory)?.name

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '16px',
                      flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1a2b4a' }}>
              {currentCategoryName || 'All Products'}
            </h1>
            {!loading && !error && (
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: '.9rem' }}>
                Showing {products.length} of {total} products
              </p>
            )}
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input placeholder="Search products…" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ padding: '10px 14px', width: '260px', border: '1px solid #ddd',
                       borderRadius: '8px', fontSize: '.95rem', outline: 'none' }} />
            <button type="submit" style={{
              padding: '10px 20px', background: '#1a2b4a', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
                style={{ padding: '10px 14px', background: '#eee', border: 'none',
                         borderRadius: '8px', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </form>
        </div>

        {/* ── Category filter bar ── */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button onClick={() => selectCategory('')}
            style={{
              padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
              fontSize: '.85rem', fontWeight: '500',
              border: !selectedCategory ? 'none' : '1px solid #ddd',
              background: !selectedCategory ? '#1a2b4a' : '#fff',
              color: !selectedCategory ? '#fff' : '#555',
            }}>
            All
          </button>
          {categories.map((cat) => {
            const active = String(cat.id) === selectedCategory
            return (
              <button key={cat.id} onClick={() => selectCategory(cat.id)}
                style={{
                  padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '.85rem', fontWeight: '500',
                  border: active ? 'none' : '1px solid #ddd',
                  background: active ? '#1a2b4a' : '#fff',
                  color: active ? '#fff' : '#555',
                }}>
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Error */}
        {error && !loading && <ErrorMessage message={error} onRetry={() => fetchProducts(search, selectedCategory)} />}

        {/* Skeleton loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {/* No results */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
            No products found{search ? ` for "${search}"` : ''}{currentCategoryName ? ` in ${currentCategoryName}` : ''}
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                  padding: '16px', height: '100%', boxSizing: 'border-box',
                  transition: 'box-shadow .2s, transform .2s', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      style={{ width: '100%', height: '120px', objectFit: 'contain',
                               borderRadius: '6px', marginBottom: '12px', background: '#fff' }} />
                  ) : (
                    <div style={{ background: '#f0f4ff', borderRadius: '6px', height: '120px',
                                  marginBottom: '12px', display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontSize: '2rem' }}>🛍️</div>
                  )}
                  <div>
                    <p style={{ margin: '0 0 6px', fontWeight: '600', fontSize: '.9rem', color: '#1a2b4a',
                                lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                    <p style={{ margin: '0 0 8px', color: '#aaa', fontSize: '.8rem' }}>{p.origin_country || 'USA'}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#1a2b4a', fontSize: '1rem' }}>
                      ${parseFloat(p.base_price_usd).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more */}
        {nextPage && !loading && !error && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button onClick={loadMore} disabled={loadingMore} style={{
              padding: '12px 40px', background: '#1a2b4a', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '1rem', opacity: loadingMore ? 0.7 : 1
            }}>
              {loadingMore ? 'Loading more…' : `Load More (${total - products.length} remaining)`}
            </button>
          </div>
        )}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  )
}
