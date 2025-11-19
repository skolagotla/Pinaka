/**
 * Custom 404 Page
 * Prevents Next.js from trying to use React context during static generation
 */

export default function Custom404() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>API endpoints are available at <code>/api/*</code></p>
    </div>
  );
}

