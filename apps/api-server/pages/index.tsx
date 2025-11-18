/**
 * API Server Index Page
 * 
 * This page is shown when accessing the API server directly.
 * The API server should be accessed via the web app proxy at /api/*
 */

export default function ApiServerIndex() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Pinaka API Server</h1>
      <p>This is the API server for Pinaka.</p>
      <p>API endpoints are available at <code>/api/*</code></p>
      <p>Access the web application at <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>
  );
}

