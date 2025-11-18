import './globals.css';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '20px' }}>
          <h1>Minimal Layout Test</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
