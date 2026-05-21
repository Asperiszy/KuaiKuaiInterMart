// Reusable loading spinner component
export default function LoadingSpinner({ message = 'Loading…', fullPage = false }) {
  const containerStyle = fullPage ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.85)', zIndex: 999,
  } : {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px',
  }

  return (
    <div style={containerStyle}>
      <div style={{
        width: '48px', height: '48px',
        border: '5px solid #e0e0e0',
        borderTop: '5px solid #1a2b4a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ marginTop: '16px', color: '#555', fontSize: '1rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
