'use client';

export default function Error({ error, reset }) {
  console.error('[Error Boundary] Error caught:', error);
  console.error('[Error Boundary] Error message:', error?.message);
  console.error('[Error Boundary] Error stack:', error?.stack);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Something went wrong!</h1>
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
  );
}

