import { useEffect, useState } from 'react'
import { ordersApi, logisticsApi } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const statusColor = {
  pending: '#f0c040', paid: '#4caf50', processing: '#2196f3',
  shipped: '#9c27b0', delivered: '#4caf50', cancelled: '#f44336',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [tracking, setTracking] = useState({})
  const [trackingLoading, setTrackingLoading] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    setError(null)
    ordersApi.list()
      .then(({ data }) => setOrders(data.results ?? data))
      .catch((err) => {
        if (err.response?.status === 401) {
          setError('You need to be logged in to view your orders.')
        } else if (!navigator.onLine) {
          setError('You appear to be offline.')
        } else {
          setError('Failed to load orders. Make sure the backend is running.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const fetchTracking = async (orderId) => {
    setTrackingLoading(prev => ({ ...prev, [orderId]: true }))
    try {
      const { data } = await logisticsApi.track(orderId)
      setTracking(prev => ({ ...prev, [orderId]: data }))
    } catch (err) {
      setTracking(prev => ({
        ...prev,
        [orderId]: { error: err.response?.status === 404
          ? 'No tracking info available yet.'
          : 'Failed to load tracking. Please try again.' }
      }))
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }))
    }
  }

  if (loading) return <LoadingSpinner message="Loading your orders…" />
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />
  if (orders.length === 0) return (
    <main style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
      <h2 style={{ color: '#1a2b4a' }}>No orders yet</h2>
      <p style={{ color: '#888' }}>Place your first order to see it here!</p>
    </main>
  )

  return (
    <main style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '10px',
                                     padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
            <span style={{ background: statusColor[order.status] || '#ccc',
                           color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '.85rem' }}>
              {order.status}
            </span>
          </div>
          <p style={{ color: '#555', margin: '8px 0' }}>
            Total: {order.currency} {order.total_amount} · {new Date(order.created_at).toLocaleDateString()}
          </p>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {order.items?.map((item) => (
              <li key={item.id}>{item.product_name} × {item.quantity}</li>
            ))}
          </ul>

          {['shipped', 'paid', 'processing', 'delivered'].includes(order.status) && (
            <button onClick={() => fetchTracking(order.id)}
              disabled={trackingLoading[order.id]}
              style={{ marginTop: 8, padding: '6px 14px', cursor: 'pointer',
                       border: '1px solid #1a2b4a', borderRadius: '6px', background: 'none',
                       display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {trackingLoading[order.id] && (
                <span style={{
                  width: '12px', height: '12px',
                  border: '2px solid #ccc', borderTop: '2px solid #1a2b4a',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.8s linear infinite'
                }} />
              )}
              {trackingLoading[order.id] ? 'Loading…' : 'Track Shipment'}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </button>
          )}

          {tracking[order.id] && (
            <div style={{ marginTop: 8, background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
              {tracking[order.id].error
                ? <p style={{ color: '#e53935', margin: 0 }}>{tracking[order.id].error}</p>
                : <>
                    <p><strong>{tracking[order.id].tracking_number}</strong> via {tracking[order.id].carrier}</p>
                    <p>Status: {tracking[order.id].status}</p>
                    {tracking[order.id].estimated_delivery &&
                      <p>Est. delivery: {tracking[order.id].estimated_delivery}</p>}
                  </>}
            </div>
          )}
        </div>
      ))}
    </main>
  )
}
