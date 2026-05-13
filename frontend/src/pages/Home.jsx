import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#1a2b4a' }}>Welcome to GlobalMart</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: '600px', margin: '16px auto' }}>
        Cross-border e-commerce — compare prices across regions, track your shipments, 
        and pay in your local currency.
      </p>
      <Link to="/products" style={{
        display: 'inline-block', marginTop: '24px', padding: '12px 32px',
        background: '#1a2b4a', color: '#fff', borderRadius: '8px', textDecoration: 'none',
        fontSize: '1rem'
      }}>
        Browse Products
      </Link>
    </main>
  )
}
