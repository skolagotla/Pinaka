/**
 * Country/Region Query Cache
 * Caches frequently accessed country and region data to reduce database queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CountryRegionCache {
  private countryCache: Map<string, CacheEntry<any>> = new Map();
  private regionCache: Map<string, CacheEntry<any>> = new Map();
  private countryCodeCache: Map<string, CacheEntry<string>> = new Map(); // name -> code
  private regionCodeCache: Map<string, CacheEntry<string>> = new Map(); // countryCode+name -> code

  // Cache TTL: 1 hour for country/region data (rarely changes)
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Get cached entry or null if expired/missing
   */
  private getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key); // Expired, remove from cache
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl?: number): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  /**
   * Get country by code (cached)
   */
  async getCountryByCode(code: string, prisma: any): Promise<any | null> {
    const cacheKey = `code:${code.toUpperCase()}`;
    const cached = this.getCached(this.countryCache, cacheKey);
    if (cached) return cached;

    const country = await prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (country) {
      this.setCached(this.countryCache, cacheKey, country);
    }

    return country;
  }

  /**
   * Get country by name (cached)
   */
  async getCountryByName(name: string, prisma: any): Promise<any | null> {
    const cacheKey = `name:${name.toLowerCase()}`;
    const cached = this.getCached(this.countryCache, cacheKey);
    if (cached) return cached;

    const country = await prisma.country.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: name, mode: 'insensitive' } },
        ],
      },
    });

    if (country) {
      // Cache by both name and code
      this.setCached(this.countryCache, `name:${name.toLowerCase()}`, country);
      this.setCached(this.countryCache, `code:${country.code}`, country);
    }

    return country;
  }

  /**
   * Get country code from name (cached)
   */
  async getCountryCode(nameOrCode: string, prisma: any): Promise<string | null> {
    // Quick check: if it's already a 2-letter code, return it
    if (nameOrCode && nameOrCode.length === 2) {
      return nameOrCode.toUpperCase();
    }

    const cacheKey = nameOrCode.toLowerCase();
    const cached = this.getCached(this.countryCodeCache, cacheKey);
    if (cached) return cached;

    const country = await this.getCountryByName(nameOrCode, prisma);
    const code = country ? country.code : null;

    if (code) {
      this.setCached(this.countryCodeCache, cacheKey, code);
    }

    return code;
  }

  /**
   * Get region by code (cached)
   */
  async getRegionByCode(countryCode: string, regionCode: string, prisma: any): Promise<any | null> {
    const cacheKey = `${countryCode.toUpperCase()}:${regionCode.toUpperCase()}`;
    const cached = this.getCached(this.regionCache, cacheKey);
    if (cached) return cached;

    const region = await prisma.region.findUnique({
      where: {
        countryCode_code: {
          countryCode: countryCode.toUpperCase(),
          code: regionCode.toUpperCase(),
        },
      },
    });

    if (region) {
      this.setCached(this.regionCache, cacheKey, region);
    }

    return region;
  }

  /**
   * Get region by name (cached)
   */
  async getRegionByName(countryCode: string, regionName: string, prisma: any): Promise<any | null> {
    const cacheKey = `${countryCode.toUpperCase()}:${regionName.toLowerCase()}`;
    const cached = this.getCached(this.regionCache, cacheKey);
    if (cached) return cached;

    const region = await prisma.region.findFirst({
      where: {
        countryCode: countryCode.toUpperCase(),
        OR: [
          { name: { equals: regionName, mode: 'insensitive' } },
          { code: { equals: regionName, mode: 'insensitive' } },
        ],
      },
    });

    if (region) {
      // Cache by both name and code
      this.setCached(this.regionCache, `${countryCode.toUpperCase()}:${regionName.toLowerCase()}`, region);
      this.setCached(this.regionCache, `${countryCode.toUpperCase()}:${region.code}`, region);
    }

    return region;
  }

  /**
   * Get region code from name (cached)
   */
  async getRegionCode(countryCode: string, regionName: string, prisma: any): Promise<string | null> {
    // Quick check: if it's already a 2-letter code, return it
    if (regionName && regionName.length <= 3) {
      // Could be a code, verify it exists
      const region = await this.getRegionByCode(countryCode, regionName, prisma);
      if (region) return region.code;
    }

    const cacheKey = `${countryCode.toUpperCase()}:${regionName.toLowerCase()}`;
    const cached = this.getCached(this.regionCodeCache, cacheKey);
    if (cached) return cached;

    const region = await this.getRegionByName(countryCode, regionName, prisma);
    const code = region ? region.code : null;

    if (code) {
      this.setCached(this.regionCodeCache, cacheKey, code);
    }

    return code;
  }

  /**
   * Clear all caches (useful for testing or when data changes)
   */
  clearCache(): void {
    this.countryCache.clear();
    this.regionCache.clear();
    this.countryCodeCache.clear();
    this.regionCodeCache.clear();
  }

  /**
   * Clear expired entries (can be called periodically)
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of Array.from(this.countryCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.countryCache.delete(key);
      }
    }
    
    for (const [key, entry] of Array.from(this.regionCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.regionCache.delete(key);
      }
    }
    
    for (const [key, entry] of Array.from(this.countryCodeCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.countryCodeCache.delete(key);
      }
    }
    
    for (const [key, entry] of Array.from(this.regionCodeCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.regionCodeCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getStats() {
    return {
      countryCacheSize: this.countryCache.size,
      regionCacheSize: this.regionCache.size,
      countryCodeCacheSize: this.countryCodeCache.size,
      regionCodeCacheSize: this.regionCodeCache.size,
    };
  }
}

// Singleton instance
const cache = new CountryRegionCache();

// Clear expired entries every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 30 * 60 * 1000); // 30 minutes
}

module.exports = cache;

