import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'
import OrderHistory from './pages/OrderHistory'

// BUG FIX #5: show loading screen while auth is being checked
// prevents blank flash or incorrect redirects on page refresh
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: '80vh', color: '#888' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #1a2b4a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p>Checking authentication…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />

        {/* BUG FIX: catch-all 404 route */}
        <Route path="*" element={
          <main style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '4rem' }}>404</div>
            <h2 style={{ color: '#1a2b4a' }}>Page not found</h2>
            <p style={{ color: '#888' }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ color: '#1a2b4a' }}>← Go back home</a>
          </main>
        } />
      </Routes>
    </BrowserRouter>
  )
}
