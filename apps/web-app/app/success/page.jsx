"use client";
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from "next/link";

export default function SuccessPage() {
  const { user, isLoading } = useUser();

  // Handle loading state
  if (isLoading) {
    return (
      <main className="page">
        <header className="appbar">Pinaka</header>
        <div className="center">
          <div className="card">
            <h1 className="title">Loading...</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="appbar">Pinaka</header>
      <div className="center">
        <div className="card">
          <h1 className="title">Login success</h1>
          <p>You're authenticated with Auth0.</p>
          {user?.email && (
            <p className="muted">Signed in as {user.email}</p>
          )}
          <div className="row">
            <Link className="primary" href="/">Go home</Link>
            <a className="provider" href="/auth/logout">Sign out</a>
          </div>
        </div>
      </div>
    </main>
  );
}


