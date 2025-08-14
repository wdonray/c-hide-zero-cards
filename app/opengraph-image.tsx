import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export const runtime = 'edge'

export default function og() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 72,
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
          <div style={{ fontSize: 80 }}>Hide Zero Cards</div>
          <div style={{ fontSize: 36, fontWeight: 600 }}>Interactive Place Value Teaching Tool</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
