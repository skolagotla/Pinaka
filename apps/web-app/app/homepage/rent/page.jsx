import { auth0 } from '@/lib/auth0';
import Link from "next/link";

// Mark as dynamic since we use getSession which requires headers
export const dynamic = 'force-dynamic';

export default async function RentPage() {
  const session = await auth0.getSession();
  const name = session?.user?.name || "";
  return (
    <main className="page">
      <div style={{ width: "100%", maxWidth: 1280, margin: "24px auto", padding: "0 16px" }}>
        <div className="card" style={{ width: "100%", marginTop: 12 }}>
          <div className="tabs" style={{ marginBottom: 8 }}>
            <Link className="tab" href="/homepage/properties">Properties</Link>
            <Link className="tab" href="/homepage/tenants">Tenants</Link>
            <Link className="tab active" href="/homepage/rent">Rent</Link>
            <Link className="tab" href="/homepage/maintenance">Maintenance</Link>
          </div>
          <div className="card-actions">
            <button className="icon-button" aria-label="Add rent" title="Add rent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
            </button>
            <button className="icon-button" aria-label="Edit rent" title="Edit rent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04c.39-.39.39-1.02 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66Z"/></svg>
            </button>
            <button className="icon-button danger" aria-label="Delete rent" title="Delete rent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 7h12v2H6V7Zm2 3h8l-1 9H9L8 10Zm3-6h2l1 1h4v2H6V5h4l1-1Z"/></svg>
            </button>
          </div>
          <div className="grid" role="table" aria-label="Rent">
            <div className="grid-row grid-header" role="row">
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Property</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Month</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Amount</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Status</div>
            </div>
            <div className="grid-row" role="row"><div className="grid-cell" role="cell" style={{ gridColumn: "1 / span 4", color: "#5f6368", textAlign: "center" }}>No rent records.</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}


