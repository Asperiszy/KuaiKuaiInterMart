import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi, paymentsApi } from '../services/api'

// Simple cart stored in component state for MVP
// Replace with Context/Zustand later if needed
export default function Cart() {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('credit_card')
  const [status, setStatus] = useState('')

  // In a real app you'd pull this from a CartContext
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')

  const placeOrder = async () => {
    if (!address) { setStatus('Please enter a shipping address.'); return }
    setStatus('Placing order…')
    try {
      const { data: order } = await ordersApi.create({
        shipping_address: address,
        items: cartItems.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      setStatus('Processing payment…')
      await paymentsApi.simulate(order.id, method)
      localStorage.removeItem('cart')
      setStatus('✅ Order placed and paid! Redirecting…')
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      setStatus('❌ Something went wrong: ' + (err.response?.data?.detail || err.message))
    }
  }

  if (cartItems.length === 0) {
    return <main style={{ padding: 32 }}><h2>Your cart is empty</h2></main>
  }

  return (
    <main style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Checkout</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>{item.name} × {item.quantity} — ${item.price * item.quantity}</li>
        ))}
      </ul>
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea placeholder="Shipping address" value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minHeight: '80px' }} />
        <select value={method} onChange={e => setMethod(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <option value="credit_card">Credit Card (Simulated)</option>
          <option value="paypal">PayPal (Simulated)</option>
          <option value="alipay">Alipay (Simulated)</option>
          <option value="wechat_pay">WeChat Pay (Simulated)</option>
        </select>
        <button onClick={placeOrder}
          style={{ padding: '12px', background: '#1a2b4a', color: '#fff',
                   border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
          Place Order & Pay
        </button>
        {status && <p style={{ color: status.startsWith('❌') ? 'red' : '#333' }}>{status}</p>}
      </div>
    </main>
  )
}
