/**
 * Help Center Search Index
 * Builds a searchable index from markdown documentation files
 */

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  headings: string[];
  path: string;
  excerpt: string;
}

export interface SearchResult {
  article: HelpArticle;
  score: number;
  matches: string[];
}

// Help article categories
export const HELP_CATEGORIES = [
  { id: 'overview', name: 'Overview', icon: '📘' },
  { id: 'architecture', name: 'Architecture', icon: '🏗️' },
  { id: 'api', name: 'Backend API', icon: '🔌' },
  { id: 'frontend', name: 'Frontend', icon: '💻' },
  { id: 'database', name: 'Database', icon: '🗄️' },
  { id: 'rbac', name: 'RBAC', icon: '🔐' },
  { id: 'domain', name: 'Domain Models', icon: '📦' },
  { id: 'portfolio', name: 'Portfolio', icon: '📊' },
  { id: 'onboarding', name: 'Onboarding', icon: '🚀' },
  { id: 'auth', name: 'Authentication', icon: '🔑' },
  { id: 'development', name: 'Development', icon: '🛠️' },
  { id: 'deployment', name: 'Deployment', icon: '🚢' },
  { id: 'reference', name: 'Reference', icon: '📚' },
  { id: 'glossary', name: 'Glossary', icon: '📖' },
] as const;

// Map documentation files to categories
const DOC_CATEGORY_MAP: Record<string, string> = {
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

// Documentation content (will be loaded from files)
let articlesCache: HelpArticle[] | null = null;

/**
 * Extract title from markdown content
 */
export function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  return 'Untitled';
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(content: string): string[] {
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  return headings;
}

/**
 * Extract excerpt (first paragraph) from markdown content
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown syntax
  let text = content
    .replace(/^#+\s+/gm, '') // Remove headings
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/`([^`]+)`/g, '$1') // Remove code, keep text
    .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
    .trim();
  
  // Get first paragraph
  const firstParagraph = text.split('\n\n')[0] || text.split('\n')[0] || text;
  
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength) + '...';
  }
  
  return firstParagraph;
}

/**
 * Load and parse markdown documentation files
 */
export async function loadHelpArticles(): Promise<HelpArticle[]> {
  if (articlesCache) {
    return articlesCache;
  }

  const articles: HelpArticle[] = [];
  
  // Load each documentation file
  for (const [filename, category] of Object.entries(DOC_CATEGORY_MAP)) {
    try {
      // In Next.js, we'll need to import these files
      // For now, we'll create a mapping that will be populated at runtime
      const articleId = filename.replace('.md', '').toLowerCase();
      const path = `/help/${category}/${articleId}`;
      
      articles.push({
        id: articleId,
        title: '', // Will be populated from file
        category,
        content: '', // Will be populated from file
        headings: [], // Will be populated from file
        path,
        excerpt: '', // Will be populated from file
      });
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
    }
  }
  
  articlesCache = articles;
  return articles;
}

/**
 * Build search index from articles
 */
function buildSearchIndex(articles: HelpArticle[]): Map<string, HelpArticle> {
  const index = new Map<string, HelpArticle>();
  articles.forEach(article => {
    index.set(article.id, article);
  });
  return index;
}

/**
 * Simple fuzzy search implementation
 */
function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) {
    return true;
  }
  
  // Word-by-word match
  const queryWords = queryLower.split(/\s+/);
  return queryWords.every(word => textLower.includes(word));
}

/**
 * Calculate search score
 */
function calculateScore(query: string, article: HelpArticle): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (article.title.toLowerCase().includes(queryLower)) {
    score += 100;
  }
  
  // Heading matches (high weight)
  article.headings.forEach(heading => {
    if (heading.toLowerCase().includes(queryLower)) {
      score += 50;
    }
  });
  
  // Content match (lower weight)
  if (article.content.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  // Exact phrase match bonus
  if (article.content.toLowerCase().includes(queryLower)) {
    score += 20;
  }
  
  return score;
}

/**
 * Search help articles
 */
export function searchHelpArticles(
  articles: HelpArticle[],
  query: string
): SearchResult[] {
  if (!query || query.trim().length === 0 || articles.length === 0) {
    return [];
  }
  
  const queryLower = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  
  articles.forEach(article => {
    const matches: string[] = [];
    let score = 0;
    
    // Check title
    if (fuzzyMatch(queryLower, article.title)) {
      matches.push('title');
      score += calculateScore(queryLower, article);
    }
    
    // Check headings
    article.headings.forEach(heading => {
      if (fuzzyMatch(queryLower, heading)) {
        matches.push(`heading: ${heading}`);
        score += 50;
      }
    });
    
    // Check content
    if (fuzzyMatch(queryLower, article.content)) {
      matches.push('content');
      score += 10;
    }
    
    if (score > 0) {
      results.push({
        article,
        score,
        matches,
      });
    }
  });
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(
  articles: HelpArticle[],
  category: string
): HelpArticle[] {
  return articles.filter(article => article.category === category);
}

/**
 * Get article by ID
 */
export function getArticleById(
  articles: HelpArticle[],
  id: string
): HelpArticle | undefined {
  return articles.find(article => article.id === id);
}

