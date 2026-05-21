// Reusable error message component
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      maxWidth: '400px', margin: '0 auto'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
      <h3 style={{ color: '#e53935', margin: '0 0 8px' }}>Something went wrong</h3>
      <p style={{ color: '#888', margin: '0 0 20px', fontSize: '.95rem' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '10px 24px', background: '#1a2b4a', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem'
        }}>
          Try Again
        </button>
      )}
    </div>
  )
}
