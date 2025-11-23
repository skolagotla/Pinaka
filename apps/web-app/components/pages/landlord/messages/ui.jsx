"use client";

import dynamic from 'next/dynamic';
import { Spinner } from 'flowbite-react';

// Lazy load MessagesClient for better performance and code splitting
const MessagesClient = dynamic(
  () => import('@/components/shared/MessagesClient'),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-500">Loading messages...</div>
      </div>
    ),
    ssr: false, // Not needed for SEO, improves initial load
  }
);

export default function LandlordMessagesClient() {
  return <MessagesClient userRole="landlord" />;
}
