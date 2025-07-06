import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#000',
          color: '#FFD700',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Luxury Experience Loading...
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.8 }}>
            Please refresh to experience the Richard Mille showcase
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(45deg, #FFD700, #D4AF37)',
              border: 'none',
              borderRadius: '4px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Refresh Experience
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary