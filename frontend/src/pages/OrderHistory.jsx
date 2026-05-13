import { useEffect, useState } from 'react'
import { ordersApi, logisticsApi } from '../services/api'

const statusColor = {
  pending: '#f0c040', paid: '#4caf50', processing: '#2196f3',
  shipped: '#9c27b0', delivered: '#4caf50', cancelled: '#f44336',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [tracking, setTracking] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list()
      .then(({ data }) => setOrders(data.results ?? data))
      .finally(() => setLoading(false))
  }, [])

  const fetchTracking = async (orderId) => {
    try {
      const { data } = await logisticsApi.track(orderId)
      setTracking(prev => ({ ...prev, [orderId]: data }))
    } catch {
      setTracking(prev => ({ ...prev, [orderId]: { error: 'No tracking info yet.' } }))
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading orders…</p>
  if (orders.length === 0) return <main style={{ padding: 32 }}><h2>No orders yet</h2></main>

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
            Total: {order.currency} {order.total_amount} · Placed: {new Date(order.created_at).toLocaleDateString()}
          </p>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {order.items?.map((item) => (
              <li key={item.id}>{item.product_name} × {item.quantity}</li>
            ))}
          </ul>
          {['shipped', 'paid', 'processing', 'delivered'].includes(order.status) && (
            <button onClick={() => fetchTracking(order.id)}
              style={{ marginTop: 8, padding: '6px 14px', cursor: 'pointer',
                       border: '1px solid #1a2b4a', borderRadius: '6px', background: 'none' }}>
              Track Shipment
            </button>
          )}
          {tracking[order.id] && (
            <div style={{ marginTop: 8, background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
              {tracking[order.id].error
                ? <p>{tracking[order.id].error}</p>
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
