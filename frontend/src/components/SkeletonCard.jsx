// Skeleton loader for product cards — shows while products are fetching
export function ProductCardSkeleton() {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee', borderRadius: '10px',
      padding: '16px', height: '220px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {/* Image placeholder */}
      <div style={{ ...shimmer, height: '120px', borderRadius: '6px' }} />
      {/* Title */}
      <div style={{ ...shimmer, height: '14px', borderRadius: '4px', width: '90%' }} />
      <div style={{ ...shimmer, height: '14px', borderRadius: '4px', width: '60%' }} />
      {/* Price */}
      <div style={{ ...shimmer, height: '16px', borderRadius: '4px', width: '40%' }} />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  )
}

const shimmer = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '400px 100%',
  animation: 'shimmer 1.2s infinite linear',
}
