/**
 * Help Center Search Results Page
 */

"use client";

import { useSearchParams } from 'next/navigation';
import { Card, Badge, Spinner } from 'flowbite-react';
import { HiDocumentText, HiSearch } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import HelpSearch from '@/components/help/HelpSearch';
import { useHelpArticles } from '@/lib/hooks/useHelpArticles';
import { searchHelpArticles, HelpArticle } from '@/lib/help/searchIndex';

export default function HelpSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const { articles, loading, search } = useHelpArticles();

  const results = query ? search(query) : [];

  const handleArticleClick = (article: HelpArticle) => {
    router.push(`/help?category=${article.category}&article=${article.id}`);
  };

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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Search Results
        </h1>
        <div className="max-w-2xl">
          <HelpSearch placeholder="Search help articles..." />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <Spinner size="xl" />
          </div>
        </Card>
      ) : query && results.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <HiSearch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No results found</p>
            <p className="text-sm">Try different keywords or browse categories.</p>
          </div>
        </Card>
      ) : query && results.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </div>
          {results.map((article) => (
            <Card
              key={article.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleArticleClick(article)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <HiDocumentText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {highlightText(article.title, query)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {highlightText(article.excerpt, query)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge color="blue" size="sm">
                      {article.category}
                    </Badge>
                    {article.headings.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {article.headings.length} section{article.headings.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <HiSearch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Start searching</p>
            <p className="text-sm">Enter keywords in the search bar above.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

