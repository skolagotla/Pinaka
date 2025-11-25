/**
 * Help Center Main Page
 */

"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Drawer, DrawerItems } from 'flowbite-react';
import { HiMenu, HiQuestionMarkCircle, HiPlay } from 'react-icons/hi';
import HelpSearch from '@/components/help/HelpSearch';
import HelpCategoryList from '@/components/help/HelpCategoryList';
import HelpContentRenderer from '@/components/help/HelpContentRenderer';
import { useHelpArticles } from '@/lib/hooks/useHelpArticles';
import { HelpArticle, HELP_CATEGORIES } from '@/lib/help/searchIndex';
import { useTour } from '@/components/tour/TourProvider';
import { getTourForRole } from '@/lib/tour/tourSteps';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import Link from 'next/link';

export default function HelpCenterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const articleId = searchParams.get('article') || '';
  
  const { articles, loading, getByCategory, getById } = useHelpArticles();
  const { hasRole } = useV2Auth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'overview');
  
  const tour = useTour();

  // Load article if articleId is provided
  useEffect(() => {
    if (articleId) {
      const article = getById(articleId);
      if (article) {
        setSelectedArticle(article);
        setSelectedCategory(article.category);
      }
    }
  }, [articleId, getById]);

  // Load category articles if category is provided
  useEffect(() => {
    if (category && !articleId) {
      const categoryArticles = getByCategory(category);
      if (categoryArticles.length > 0) {
        setSelectedArticle(categoryArticles[0]);
        setSelectedCategory(category);
      }
    } else if (!category && articles.length > 0) {
      // Default to first article
      setSelectedArticle(articles[0]);
    }
  }, [category, articleId, articles, getByCategory]);

  const handleStartTour = () => {
    if (!tour) return;
    
    let userRole: string | null = null;
    if (hasRole('super_admin')) userRole = 'super_admin';
    else if (hasRole('pmc_admin')) userRole = 'pmc_admin';
    else if (hasRole('pm')) userRole = 'pm';
    else if (hasRole('landlord')) userRole = 'landlord';
    else if (hasRole('tenant')) userRole = 'tenant';
    else if (hasRole('vendor')) userRole = 'vendor';

    if (!userRole) return;

    const tourConfig = getTourForRole(userRole);
    if (tourConfig) {
      tour.startTour(tourConfig);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const categoryArticles = getByCategory(categoryId);
    if (categoryArticles.length > 0) {
      setSelectedArticle(categoryArticles[0]);
      router.push(`/help?category=${categoryId}&article=${categoryArticles[0].id}`);
    } else {
      router.push(`/help?category=${categoryId}`);
    }
    setMobileMenuOpen(false);
  };

  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);
    setSelectedCategory(article.category);
    router.push(`/help?category=${article.category}&article=${article.id}`);
    setMobileMenuOpen(false);
  };

  const categoryArticles = getByCategory(selectedCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HiQuestionMarkCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Help Center
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="blue"
              size="sm"
              onClick={handleStartTour}
              className="hidden md:flex"
            >
              <HiPlay className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
            <Button
              color="gray"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            >
              <HiMenu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl">
          <HelpSearch 
            onSelectArticle={handleArticleSelect}
            placeholder="Search help articles..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Category Sidebar */}
        <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4">
          <HelpCategoryList onCategorySelect={handleCategorySelect} />
          
          {/* Category Articles List */}
          {!loading && categoryArticles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Articles in this category
              </h4>
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
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          <DrawerItems>
            <div className="p-4">
              <HelpCategoryList onCategorySelect={handleCategorySelect} />
              
              {categoryArticles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Articles
                  </h4>
                  <div className="space-y-1">
                    {categoryArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleSelect(article)}
                        className="w-full text-left px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {article.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DrawerItems>
        </Drawer>

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

