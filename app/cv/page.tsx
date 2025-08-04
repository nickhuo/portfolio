'use client'
import { useEffect } from 'react'

export default function CV() {
  useEffect(() => {
    window.location.replace('/JiajunHuo_SWE_UIUC_Resume.pdf')
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#666',
      backgroundColor: '#fff'
    }}>
      <p>Redirecting to CV...</p>
      {/* Meta refresh as fallback */}
      <meta httpEquiv="refresh" content="0; url=/JiajunHuo_SWE_UIUC_Resume.pdf" />
    </div>
  )
}