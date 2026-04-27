import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Spot-On Fresh Juices and Salads';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #064E3B, #022C22)', // Green gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 140,
            marginBottom: '40px',
          }}
        >
          🍊
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: 'white',
            marginBottom: '30px',
            letterSpacing: '-0.02em',
          }}
        >
          Spot-On
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            color: '#34D399', // Emerald-400
            letterSpacing: '0.05em',
          }}
        >
          FRESH JUICES & SALADS
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
