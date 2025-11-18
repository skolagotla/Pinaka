'use client';

export default function GlobalError({ error, reset }) {
  console.error('[Global Error] Error caught:', error);
  console.error('[Global Error] Error message:', error?.message);
  console.error('[Global Error] Error stack:', error?.stack);

  return (
    <html>
      <body>
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>Application Error</h1>
          <p style={{ color: 'red' }}>{error?.message || 'Unknown error'}</p>
          <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '800px', margin: '20px auto' }}>
            <summary>Error Details</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {error?.stack || JSON.stringify(error, null, 2)}
            </pre>
          </details>
          <button 
            onClick={reset}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

