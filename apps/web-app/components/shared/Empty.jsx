/**
 * Empty Component
 * Displays an empty state when there's no data
 */

"use client";

export default function Empty({ 
  description = "No data available",
  image,
  children 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {image && <div className="mb-4">{image}</div>}
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {children && <div>{children}</div>}
    </div>
  );
}

