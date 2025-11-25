/**
 * Help Center Category List Component
 */

"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Badge } from 'flowbite-react';
import { HELP_CATEGORIES } from '@/lib/help/searchIndex';
import { useHelpArticles } from '@/lib/hooks/useHelpArticles';

interface HelpCategoryListProps {
  onCategorySelect?: (category: string) => void;
}

export default function HelpCategoryList({ onCategorySelect }: HelpCategoryListProps) {
  const pathname = usePathname();
  const { articles } = useHelpArticles();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    HELP_CATEGORIES.forEach(cat => {
      counts[cat.id] = articles.filter(a => a.category === cat.id).length;
    });
    return counts;
  }, [articles]);

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Categories
        </h3>
      </div>
      
      {HELP_CATEGORIES.map((category) => {
        const isActive = pathname?.includes(`/help/${category.id}`);
        const count = categoryCounts[category.id] || 0;
        
        if (count === 0) return null;
        
        return (
          <Link
            key={category.id}
            href={`/help/${category.id}`}
            onClick={() => handleCategoryClick(category.id)}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              <Badge color="gray" size="sm">
                {count}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

