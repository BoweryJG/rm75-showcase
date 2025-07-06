const LoadingPlaceholder = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'monospace'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 10px'
    }} />
    Loading RM 75-01...
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

export default LoadingPlaceholder