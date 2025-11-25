/**
 * Portfolio Layout
 * 
 * Note: This layout is intentionally minimal because the parent ProtectedLayoutWrapper
 * already provides the UnifiedSidebar and UnifiedNavbar. This layout just passes
 * through the children without creating duplicate navigation elements.
 */
"use client";

export default function PortfolioLayout({ children }) {
  // Just pass through children - parent ProtectedLayoutWrapper handles all navigation
  return <>{children}</>;
}
