import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ordersApi, paymentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cart, setCart] = useState([])
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('credit_card')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(saved)
  }, [])

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    )
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return }
    if (!address.trim()) { setStatus('⚠️ Please enter a shipping address.'); return }
    if (cart.length === 0) { setStatus('⚠️ Your cart is empty.'); return }

    setLoading(true)
    setStatus('Placing order…')
    try {
      const { data: order } = await ordersApi.create({
        shipping_address: address,
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      setStatus('Processing payment…')
      await paymentsApi.simulate(order.id, method)
      clearCart()
      setStatus('✅ Order placed successfully! Redirecting…')
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      setStatus('❌ Something went wrong: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0 && !status) {
    return (
      <main style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h2 style={{ color: '#1a2b4a' }}>Your cart is empty</h2>
        <p style={{ color: '#888' }}>Add some products to get started!</p>
        <Link to="/products" style={{
          display: 'inline-block', marginTop: '16px', padding: '12px 32px',
          background: '#1a2b4a', color: '#fff', borderRadius: '8px', textDecoration: 'none'
        }}>
          Browse Products
        </Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a2b4a', marginBottom: '8px' }}>🛒 Your Cart</h1>
      <p style={{ color: '#888', marginBottom: '24px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* ── Left: Product list ── */}
        <div>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: '8px', padding: '10px 16px',
            background: '#1a2b4a', color: '#fff',
            borderRadius: '8px 8px 0 0', fontWeight: 'bold', fontSize: '.9rem'
          }}>
            <span>Product</span>
            <span style={{ textAlign: 'center' }}>Unit Price</span>
            <span style={{ textAlign: 'center' }}>Quantity</span>
            <span style={{ textAlign: 'center' }}>Subtotal</span>
            <span></span>
          </div>

          {/* Cart items */}
          {cart.map((item, index) => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: '8px', padding: '14px 16px', alignItems: 'center',
              background: index % 2 === 0 ? '#fff' : '#f9f9f9',
              borderLeft: '1px solid #eee', borderRight: '1px solid #eee',
              borderBottom: '1px solid #eee',
            }}>
              {/* Product name */}
              <span style={{ fontWeight: '500', fontSize: '.9rem', color: '#333',
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>

              {/* Unit price */}
              <span style={{ textAlign: 'center', color: '#555', fontSize: '.95rem' }}>
                ${item.price.toFixed(2)}
              </span>

              {/* Quantity controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={qBtn}>−</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                  {item.quantity}
                </span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={qBtn}>+</button>
              </div>

              {/* Subtotal */}
              <span style={{ textAlign: 'center', fontWeight: 'bold', color: '#1a2b4a' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>

              {/* Remove */}
              <button onClick={() => removeItem(item.id)}
                title="Remove item"
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                         color: '#e53935', fontSize: '1.1rem', padding: '4px' }}>
                ✕
              </button>
            </div>
          ))}

          {/* Clear cart */}
          {cart.length > 0 && (
            <div style={{ padding: '12px 16px', borderLeft: '1px solid #eee',
                          borderRight: '1px solid #eee', borderBottom: '1px solid #eee',
                          borderRadius: '0 0 8px 8px', textAlign: 'right' }}>
              <button onClick={clearCart}
                style={{ background: 'none', border: 'none', color: '#e53935',
                         cursor: 'pointer', fontSize: '.85rem', textDecoration: 'underline' }}>
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Order summary ── */}
        <div style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Summary header */}
          <div style={{ background: '#1a2b4a', color: '#fff', padding: '14px 20px',
                        fontWeight: 'bold', fontSize: '1rem' }}>
            Order Summary
          </div>

          <div style={{ padding: '20px' }}>
            {/* Price breakdown */}
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between',
                                          marginBottom: '8px', fontSize: '.9rem', color: '#555' }}>
                <span style={{ maxWidth: '180px', overflow: 'hidden',
                               textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <hr style={{ margin: '12px 0', borderColor: '#eee' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontWeight: 'bold', fontSize: '1.1rem', color: '#1a2b4a',
                          marginBottom: '20px' }}>
              <span>Total</span>
              <span>${cartTotal.toFixed(2)} USD</span>
            </div>

            {/* Shipping address */}
            <label style={{ display: 'block', fontWeight: 'bold',
                            marginBottom: '6px', fontSize: '.9rem' }}>
              Shipping Address
            </label>
            <textarea
              placeholder="Enter your full shipping address…"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc',
                       borderRadius: '6px', minHeight: '80px', fontSize: '.9rem',
                       boxSizing: 'border-box', resize: 'vertical' }}
            />

            {/* Payment method */}
            <label style={{ display: 'block', fontWeight: 'bold',
                            margin: '12px 0 6px', fontSize: '.9rem' }}>
              Payment Method
            </label>
            <select value={method} onChange={e => setMethod(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc',
                       borderRadius: '6px', fontSize: '.9rem', background: '#fff' }}>
              <option value="credit_card">💳 Credit Card</option>
              <option value="paypal">🅿️ PayPal</option>
              <option value="alipay">🔵 Alipay</option>
              <option value="wechat_pay">💚 WeChat Pay</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
            </select>

            {/* Place order button */}
            <button onClick={placeOrder} disabled={loading}
              style={{ width: '100%', marginTop: '16px', padding: '14px',
                       background: loading ? '#aaa' : '#1a2b4a', color: '#fff',
                       border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                       fontWeight: 'bold', fontSize: '1rem' }}>
              {loading ? 'Processing…' : `Place Order — $${cartTotal.toFixed(2)}`}
            </button>

            {/* Status message */}
            {status && (
              <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '.9rem',
                          color: status.startsWith('❌') ? '#e53935'
                               : status.startsWith('⚠️') ? '#f57c00' : '#4caf50' }}>
                {status}
              </p>
            )}

            {/* Continue shopping */}
            <Link to="/products" style={{ display: 'block', textAlign: 'center',
                                          marginTop: '12px', color: '#1a2b4a',
                                          fontSize: '.85rem', textDecoration: 'underline' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

const qBtn = {
  width: '28px', height: '28px', fontSize: '1rem',
  background: '#f0f0f0', border: '1px solid #ddd',
  borderRadius: '4px', cursor: 'pointer', lineHeight: 1
}
