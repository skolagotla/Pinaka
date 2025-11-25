/**
 * React hook for loading and searching help articles
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { HelpArticle, searchHelpArticles, getArticlesByCategory, getArticleById, extractTitle, extractHeadings, extractExcerpt } from '@/lib/help/searchIndex';

export interface UseHelpArticlesReturn {
  articles: HelpArticle[];
  loading: boolean;
  error: string | null;
  search: (query: string) => HelpArticle[];
  getByCategory: (category: string) => HelpArticle[];
  getById: (id: string) => HelpArticle | undefined;
}

export function useHelpArticles(): UseHelpArticlesReturn {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);
        
        // Load all documentation files
        const docFiles = [
          '00_Overview.md',
          '01_Architecture.md',
          '02_Backend_API.md',
          '03_Frontend_Structure.md',
          '04_Database_v2_Schema.md',
          '05_RBAC_Roles_and_Permissions.md',
          '06_Domain_Models.md',
          '07_Portfolio_Module.md',
          '08_Onboarding_Flow.md',
          '09_Authentication_and_Sessions.md',
          '10_Development_Guide.md',
          '11_Deployment_Guide.md',
          '12_Folder_Reference.md',
          '13_Glossary.md',
        ];
        
        const loadedArticles: HelpArticle[] = [];
        
        for (const filename of docFiles) {
          try {
            const response = await fetch(`/api/help/docs?file=${filename}`);
            if (!response.ok) continue;
            
            const { content } = await response.json();
            
            // Parse markdown content
            const title = extractTitle(content);
            const headings = extractHeadings(content);
            const excerpt = extractExcerpt(content);
            const category = getCategoryFromFilename(filename);
            const id = filename.replace('.md', '').toLowerCase();
            
            loadedArticles.push({
              id,
              title,
              category,
              content,
              headings,
              path: `/help/${category}/${id}`,
              excerpt,
            });
          } catch (err) {
            console.error(`Failed to load ${filename}:`, err);
          }
        }
        
        setArticles(loadedArticles);
      } catch (err: any) {
        setError(err.message || 'Failed to load help articles');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticles();
  }, []);

  const search = useCallback((query: string) => {
    if (!query || query.trim().length === 0 || articles.length === 0) {
      return [];
    }
    const results = searchHelpArticles(articles, query);
    return results.map(r => r.article);
  }, [articles]);

  const getByCategory = useCallback((category: string) => {
    return getArticlesByCategory(articles, category);
  }, [articles]);

  const getById = useCallback((id: string) => {
    return getArticleById(articles, id);
  }, [articles]);

  return {
    articles,
    loading,
    error,
    search,
    getByCategory,
    getById,
  };
}

// Helper function
function getCategoryFromFilename(filename: string): string {
  const categoryMap: Record<string, string> = {
    '00_Overview.md': 'overview',
    '01_Architecture.md': 'architecture',
    '02_Backend_API.md': 'api',
    '03_Frontend_Structure.md': 'frontend',
    '04_Database_v2_Schema.md': 'database',
    '05_RBAC_Roles_and_Permissions.md': 'rbac',
    '06_Domain_Models.md': 'domain',
    '07_Portfolio_Module.md': 'portfolio',
    '08_Onboarding_Flow.md': 'onboarding',
    '09_Authentication_and_Sessions.md': 'auth',
    '10_Development_Guide.md': 'development',
    '11_Deployment_Guide.md': 'deployment',
    '12_Folder_Reference.md': 'reference',
    '13_Glossary.md': 'glossary',
  };
  
  return categoryMap[filename] || 'other';
}

