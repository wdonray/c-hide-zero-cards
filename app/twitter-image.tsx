import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 600,
}

export const contentType = 'image/png'

export const runtime = 'edge'

export default function twitter() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 68,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 72 }}>Hide Zero Cards</div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>Place Value Teaching Tool</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
