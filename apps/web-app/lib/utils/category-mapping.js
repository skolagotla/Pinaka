/**
 * Category Mapping Utility
 * Maps maintenance ticket categories to vendor specialties
 * Ensures consistency across the application
 */

// Standard maintenance categories (must match MAINTENANCE_CATEGORIES in statuses.js)
export const STANDARD_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Structural",
  "Pest Control",
  "Landscaping",
  "General Contracting",
  "Other"
];

// Mapping from vendor specialty to maintenance category
export const VENDOR_TO_CATEGORY_MAP = {
  // Direct matches
  "Plumbing": "Plumbing",
  "Electrical": "Electrical",
  "HVAC": "HVAC",
  "Appliance": "Appliance",
  "Appliance Repair": "Appliance",
  "Pest Control": "Pest Control",
  "Landscaping": "Landscaping",
  "General Contracting": "General Contracting",
  "General Contractor": "General Contracting",
  
  // Structural-related specialties
  "Structural": "Structural",
  "Masonry": "Structural",
  "Carpentry": "Structural",
  "Roofing": "Structural",
  "Flooring": "Structural",
  "Windows & Doors": "Structural",
  "Drywall": "Structural",
  "Concrete": "Structural",
  "Asphalt": "Structural",
  "Welding": "Structural",
  "Demolition": "Structural",
  
  // Other specialties that can map to "Other" or specific categories
  "Painting": "Other",
  "Cleaning": "Other",
  "Locksmith": "Other",
  "Security Systems": "Other",
  "Garage Doors": "Other",
  "Septic Systems": "Other",
  "Tile & Stone": "Other",
  "Gutters": "Other",
  "Window Cleaning": "Other",
  "Fencing": "Other",
  "Insulation": "Other",
  "Handyman": "Other",
  "Snow Removal": "Other"
};

// Reverse mapping: which vendor specialties match each category
export const CATEGORY_TO_VENDOR_MAP = {
  "Plumbing": ["Plumbing"],
  "Electrical": ["Electrical"],
  "HVAC": ["HVAC"],
  "Appliance": ["Appliance", "Appliance Repair"],
  "Structural": [
    "Structural", "Masonry", "Carpentry", "Roofing", "Flooring",
    "Windows & Doors", "Drywall", "Concrete", "Asphalt", "Welding", "Demolition"
  ],
  "Pest Control": ["Pest Control"],
  "Landscaping": ["Landscaping"],
  "General Contracting": ["General Contracting", "General Contractor"],
  "Other": [
    "Painting", "Cleaning", "Locksmith", "Security Systems", "Garage Doors",
    "Septic Systems", "Tile & Stone", "Gutters", "Window Cleaning", "Fencing",
    "Insulation", "Handyman", "Snow Removal", "Other"
  ]
};

/**
 * Maps a vendor specialty to a maintenance category
 * @param {string} specialty - Vendor specialty
 * @returns {string} Maintenance category
 */
export function mapVendorSpecialtyToCategory(specialty) {
  if (!specialty) return "Other";
  return VENDOR_TO_CATEGORY_MAP[specialty] || "Other";
}

/**
 * Gets vendor specialties that match a maintenance category
 * @param {string} category - Maintenance category
 * @returns {string[]} Array of vendor specialties
 */
export function getVendorSpecialtiesForCategory(category) {
  return CATEGORY_TO_VENDOR_MAP[category] || ["Other"];
}

/**
 * Checks if a vendor specialty matches a maintenance category
 * @param {string} specialty - Vendor specialty
 * @param {string} category - Maintenance category
 * @returns {boolean} True if vendor matches category
 */
export function vendorMatchesCategory(specialty, category) {
  const mappedCategory = mapVendorSpecialtyToCategory(specialty);
  return mappedCategory === category || mappedCategory === "General Contracting";
}

/**
 * Standardizes a vendor specialty to match maintenance categories
 * @param {string} specialty - Vendor specialty
 * @returns {string} Standardized specialty
 */
export function standardizeVendorSpecialty(specialty) {
  // If it's already a standard category, return it
  if (STANDARD_CATEGORIES.includes(specialty)) {
    return specialty;
  }
  
  // Map to standard category
  const mapped = mapVendorSpecialtyToCategory(specialty);
  
  // For structural-related, keep the specific specialty but ensure it maps correctly
  if (CATEGORY_TO_VENDOR_MAP["Structural"].includes(specialty)) {
    return specialty; // Keep specific specialty like "Roofing", "Carpentry", etc.
  }
  
  // For others, return the mapped category
  return mapped === "Other" ? specialty : mapped;
}

