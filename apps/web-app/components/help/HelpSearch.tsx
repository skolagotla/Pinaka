/**
 * Help Center Search Component
 */

"use client";

import { useState, useCallback, useMemo } from 'react';
import { TextInput, Card, Badge, Spinner } from 'flowbite-react';
import { HiSearch, HiDocumentText } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useHelpArticles } from '@/lib/hooks/useHelpArticles';
import { HelpArticle } from '@/lib/help/searchIndex';

interface HelpSearchProps {
  onSelectArticle?: (article: HelpArticle) => void;
  placeholder?: string;
}

export default function HelpSearch({ onSelectArticle, placeholder = "Search help articles..." }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { articles, loading, search } = useHelpArticles();

  const results = useMemo(() => {
    if (!query || query.trim().length === 0 || articles.length === 0) {
      return [];
    }
    return search(query);
  }, [query, search, articles]);

  const handleSelect = useCallback((article: HelpArticle) => {
    if (onSelectArticle) {
      onSelectArticle(article);
    } else {
      router.push(article.path);
    }
    setQuery('');
  }, [onSelectArticle, router]);

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="relative w-full">
      <TextInput
        icon={HiSearch}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsSearching(true)}
        className="w-full"
      />
      
      {isSearching && query && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <Spinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.slice(0, 10).map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <HiDocumentText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {highlightText(article.title, query)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {highlightText(article.excerpt, query)}
                      </div>
                      <div className="mt-1">
                        <Badge color="gray" size="sm">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {results.length > 10 && (
                <div className="px-4 py-2 text-sm text-gray-500 text-center border-t border-gray-200 dark:border-gray-700">
                  {results.length - 10} more results...
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Click outside to close */}
      {isSearching && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSearching(false)}
        />
      )}
    </div>
  );
}

