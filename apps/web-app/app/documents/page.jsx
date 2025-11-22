import { redirect } from 'next/navigation';

/**
 * Redirect /documents to /library
 * This maintains backward compatibility for old bookmarks/links
 */
export default function DocumentsPage() {
  redirect('/library');
}

