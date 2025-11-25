/**
 * Help Center Category Page
 */

"use client";

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, Badge, Spinner, Button } from 'flowbite-react';
import { HiArrowLeft, HiDocumentText } from 'react-icons/hi';
import HelpSearch from '@/components/help/HelpSearch';
import HelpContentRenderer from '@/components/help/HelpContentRenderer';
import { useHelpArticles } from '@/lib/hooks/useHelpArticles';
import { HELP_CATEGORIES } from '@/lib/help/searchIndex';
import { HelpArticle } from '@/lib/help/searchIndex';

export default function HelpCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = params.category as string;
  const articleId = searchParams.get('article') || '';
  
  const { articles, loading, getByCategory, getById } = useHelpArticles();
  const categoryArticles = getByCategory(categoryId);
  const selectedArticle = articleId ? getById(articleId) : (categoryArticles[0] || null);
  
  const category = HELP_CATEGORIES.find(c => c.id === categoryId);

  const handleArticleSelect = (article: HelpArticle) => {
    router.push(`/help/${categoryId}?article=${article.id}`);
  };

  if (!category) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">Category not found</p>
            <Button color="blue" onClick={() => router.push('/help')}>
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              color="gray"
              size="sm"
              onClick={() => router.push('/help')}
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-2xl">{category.icon}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            <Badge color="blue" size="sm">
              {categoryArticles.length} article{categoryArticles.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl">
          <HelpSearch 
            onSelectArticle={handleArticleSelect}
            placeholder="Search in this category..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Articles List */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Articles
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : categoryArticles.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No articles in this category
            </div>
          ) : (
            <div className="space-y-1">
              {categoryArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleSelect(article)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedArticle?.id === article.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {article.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <HelpContentRenderer 
            article={selectedArticle} 
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

