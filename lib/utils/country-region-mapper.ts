/**
 * Utility function to map country/provinceState strings to countryCode/regionCode FKs
 * Used across multiple APIs for consistency
 * Now with caching for improved performance
 */

const { prisma } = require('../prisma');
const countryRegionCache = require('./country-region-cache');

export interface CountryRegionMappingResult {
  countryCode: string | null;
  regionCode: string | null;
}

/**
 * Maps country/provinceState strings to countryCode/regionCode FKs
 * @param country - Country name or code (legacy field)
 * @param provinceState - Province/State name or code (legacy field)
 * @param countryCode - Country code FK (new field)
 * @param regionCode - Region code FK (new field)
 * @returns Object with countryCode and regionCode
 */
export async function mapCountryRegionToFKs(
  country?: string | null,
  provinceState?: string | null,
  countryCode?: string | null,
  regionCode?: string | null
): Promise<CountryRegionMappingResult> {
  let finalCountryCode = countryCode || null;
  let finalRegionCode = regionCode || null;

  // If FKs not provided, try to map from legacy fields (using cache)
  if (!finalCountryCode && country) {
    // Check if country is already a code (CA, US) or a name
    if (country.length === 2) {
      finalCountryCode = country.toUpperCase();
      // Verify it exists in cache/DB
      const countryRecord = await countryRegionCache.getCountryByCode(finalCountryCode, prisma);
      if (!countryRecord) {
        finalCountryCode = null; // Invalid code
      }
    } else {
      // Use cache to get country code
      finalCountryCode = await countryRegionCache.getCountryCode(country, prisma);
    }
  }

  // If regionCode not provided, try to map from provinceState (using cache)
  if (finalCountryCode && !finalRegionCode && provinceState) {
    // Use cache to get region code
    finalRegionCode = await countryRegionCache.getRegionCode(finalCountryCode, provinceState, prisma);
  }

  return {
    countryCode: finalCountryCode,
    regionCode: finalRegionCode,
  };
}

/**
 * Validates that a region belongs to a country
 * @param countryCode - Country code
 * @param regionCode - Region code
 * @returns true if valid, false otherwise
 */
export async function validateCountryRegion(
  countryCode: string | null,
  regionCode: string | null
): Promise<boolean> {
  if (!countryCode || !regionCode) {
    return true; // Allow null values (optional fields)
  }

  // Use cache to validate region
  const region = await countryRegionCache.getRegionByCode(countryCode, regionCode, prisma);
  return !!region;
}

module.exports = {
  mapCountryRegionToFKs,
  validateCountryRegion,
};

