/**
 * Centralized Rules Engine
 * Uses json-rules-engine to manage business rules across the application
 */

// Lazy load dependencies to avoid SSR issues
let Engine = null;
let currencyRules = null;
let maintenanceRules = null;
let postalCodeRules = null;
let phoneNumberRules = null;

function loadDependencies() {
  if (typeof window === 'undefined') {
    // Server-side: return empty objects
    return {
      Engine: null,
      currencyRules: { rules: [] },
      maintenanceRules: { rules: [] },
      postalCodeRules: { rules: [] },
      phoneNumberRules: { rules: [] }
    };
  }
  
  // Client-side: load dependencies
  if (!Engine) {
    try {
      Engine = require('json-rules-engine').Engine;
      currencyRules = require('./currency-rules.json');
      maintenanceRules = require('./maintenance-rules.json');
      postalCodeRules = require('./postal-code-rules.json');
      phoneNumberRules = require('./phone-number-rules.json');
    } catch (error) {
      console.error('[Rules Engine] Error loading dependencies:', error);
      return {
        Engine: null,
        currencyRules: { rules: [] },
        maintenanceRules: { rules: [] },
        postalCodeRules: { rules: [] },
        phoneNumberRules: { rules: [] }
      };
    }
  }
  
  return { Engine, currencyRules, maintenanceRules, postalCodeRules, phoneNumberRules };
}

class RulesEngineManager {
  constructor() {
    this.engines = {};
    const deps = loadDependencies();
    
    if (!deps.Engine) {
      console.warn('[Rules Engine] json-rules-engine not available, using fallback');
      return;
    }
    
    this.Engine = deps.Engine;
    this.currencyRules = deps.currencyRules;
    this.maintenanceRules = deps.maintenanceRules;
    this.postalCodeRules = deps.postalCodeRules;
    this.phoneNumberRules = deps.phoneNumberRules;
    
    this.initialize();
  }

  initialize() {
    if (!this.Engine) return;
    
    // Initialize Currency Rules Engine
    this.engines.currency = new this.Engine();
    this.loadCurrencyRules();
    
    // Initialize Maintenance Rules Engine
    this.engines.maintenance = new this.Engine();
    this.loadMaintenanceRules();
    
    // Initialize Postal Code Rules Engine
    this.engines.postalCode = new this.Engine();
    this.loadPostalCodeRules();
    
    // Initialize Phone Number Rules Engine
    this.engines.phoneNumber = new this.Engine();
    this.loadPhoneNumberRules();
  }

  /**
   * Load currency formatting rules
   */
  loadCurrencyRules() {
    if (!this.engines.currency || !this.currencyRules) return;
    const engine = this.engines.currency;
    
    if (this.currencyRules.rules && Array.isArray(this.currencyRules.rules)) {
      this.currencyRules.rules.forEach(rule => {
        try {
          engine.addRule(rule);
        } catch (error) {
          console.error('[Rules Engine] Error adding currency rule:', error);
        }
      });
    }
  }

  /**
   * Load maintenance ticket business rules
   */
  loadMaintenanceRules() {
    if (!this.engines.maintenance || !this.maintenanceRules) return;
    const engine = this.engines.maintenance;
    
    if (!this.maintenanceRules.rules || !Array.isArray(this.maintenanceRules.rules)) {
      console.warn('[Rules Engine] Maintenance rules not found or invalid');
      return;
    }
    
    this.maintenanceRules.rules.forEach((rule, index) => {
      try {
        // Validate rule structure before adding
        if (!rule || !rule.conditions || !rule.event) {
          console.warn(`[Rules Engine] Skipping invalid maintenance rule at index ${index}:`, rule);
          return;
        }
        
        // Validate conditions have required properties
        const validateCondition = (condition) => {
          if (typeof condition === 'object' && condition !== null) {
            if (condition.fact && condition.operator && !('value' in condition)) {
              console.warn(`[Rules Engine] Condition missing 'value' property:`, condition);
              return false;
            }
            if (condition.all && Array.isArray(condition.all)) {
              return condition.all.every(validateCondition);
            }
            if (condition.any && Array.isArray(condition.any)) {
              return condition.any.every(validateCondition);
            }
          }
          return true;
        };
        
        if (!validateCondition(rule.conditions)) {
          console.warn(`[Rules Engine] Skipping maintenance rule with invalid conditions at index ${index}`);
          return;
        }
        
        engine.addRule(rule);
      } catch (error) {
        console.error(`[Rules Engine] Error adding maintenance rule at index ${index}:`, error, rule);
        // Continue with other rules
      }
    });
  }

  /**
   * Load postal code and zip code formatting rules
   */
  loadPostalCodeRules() {
    if (!this.engines.postalCode || !this.postalCodeRules) return;
    const engine = this.engines.postalCode;
    
    if (this.postalCodeRules.rules && Array.isArray(this.postalCodeRules.rules)) {
      this.postalCodeRules.rules.forEach(rule => {
        try {
          engine.addRule(rule);
        } catch (error) {
          console.error('[Rules Engine] Error adding postal code rule:', error);
        }
      });
    }
  }

  /**
   * Load phone number formatting rules
   */
  loadPhoneNumberRules() {
    if (!this.engines.phoneNumber || !this.phoneNumberRules) return;
    const engine = this.engines.phoneNumber;
    
    if (this.phoneNumberRules.rules && Array.isArray(this.phoneNumberRules.rules)) {
      this.phoneNumberRules.rules.forEach(rule => {
        try {
          engine.addRule(rule);
        } catch (error) {
          console.error('[Rules Engine] Error adding phone number rule:', error);
        }
      });
    }
  }

  /**
   * Get formatting rules for currency display
   * @param {Object} facts - Facts about the field (fieldType, country, etc.)
   * @returns {Promise<Object>} Formatting parameters
   */
  async getCurrencyFormatRules(facts) {
    const engine = this.engines.currency;
    
    try {
      const results = await engine.run(facts);
      
      if (results.events.length > 0) {
        // Return the highest priority rule's parameters
        const sortedEvents = results.events.sort((a, b) => b.priority - a.priority);
        return sortedEvents[0].params;
      }
      
      // Default formatting if no rules match
      return {
        useThousandsSeparator: true,
        separator: ',',
        decimalPlaces: 2,
        prefix: '$',
        enforcePositive: false
      };
    } catch (error) {
      console.error('Error executing rules engine:', error);
      return this.getDefaultCurrencyFormat();
    }
  }

  /**
   * Get formatting rules for currency input fields
   * @param {Object} facts - Facts about the field
   * @returns {Promise<Object>} Input formatting parameters
   */
  async getCurrencyInputRules(facts) {
    const inputFacts = {
      ...facts,
      fieldType: 'currency-input'
    };
    
    const engine = this.engines.currency;
    
    try {
      const results = await engine.run(inputFacts);
      
      if (results.events.length > 0) {
        return results.events[0].params;
      }
      
      return this.getDefaultCurrencyInputFormat();
    } catch (error) {
      console.error('Error executing rules engine:', error);
      return this.getDefaultCurrencyInputFormat();
    }
  }

  /**
   * Format a number according to currency rules
   * @param {number} value - The value to format
   * @param {Object} facts - Facts about the field
   * @returns {Promise<string>} Formatted currency string
   */
  async formatCurrency(value, facts = {}) {
    const rules = await this.getCurrencyFormatRules({
      fieldType: 'currency',
      ...facts
    });
    
    if (value == null || value === '') return '';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    const formatted = numValue.toLocaleString('en-US', {
      minimumFractionDigits: rules.decimalPlaces,
      maximumFractionDigits: rules.decimalPlaces,
      useGrouping: rules.useThousandsSeparator
    });
    
    return `${rules.prefix}${formatted}`;
  }

  /**
   * Parse a formatted currency string to a number
   * @param {string} value - The formatted currency string
   * @returns {number} Parsed number value
   */
  parseCurrency(value) {
    if (!value) return 0;
    // Remove all non-digit characters except decimal point and minus
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get formatter function for Ant Design InputNumber
   * @param {Object} facts - Facts about the field
   * @returns {Promise<Function>} Formatter function
   */
  async getAntdFormatter(facts = {}) {
    const rules = await this.getCurrencyFormatRules({
      fieldType: 'currency',
      ...facts
    });
    
    return (value) => {
      if (!value) return '';
      return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, rules.separator);
    };
  }

  /**
   * Get parser function for Ant Design InputNumber
   * @returns {Function} Parser function
   */
  getAntdParser() {
    return (value) => {
      return this.parseCurrency(value);
    };
  }

  /**
   * Default currency format
   */
  getDefaultCurrencyFormat() {
    return {
      useThousandsSeparator: true,
      separator: ',',
      decimalPlaces: 2,
      prefix: '$',
      enforcePositive: false
    };
  }

  /**
   * Default currency input format
   */
  getDefaultCurrencyInputFormat() {
    return {
      useThousandsSeparator: true,
      separator: ',',
      decimalPlaces: 2,
      allowNegative: false,
      maxValue: null,
      minValue: 0
    };
  }

  /**
   * Add a custom rule to the currency engine
   * @param {Object} rule - Rule definition
   */
  addCurrencyRule(rule) {
    this.engines.currency.addRule(rule);
  }

  /**
   * Remove a rule from the currency engine
   * @param {Object} rule - Rule to remove
   */
  removeCurrencyRule(rule) {
    this.engines.currency.removeRule(rule);
  }

  /**
   * Execute maintenance ticket business rules
   * @param {Object} facts - Facts about the maintenance ticket action
   * @returns {Promise<Object>} Rule execution results
   */
  async executeMaintenanceRules(facts) {
    const engine = this.engines.maintenance;
    
    try {
      const results = await engine.run(facts);
      
      if (results.events.length > 0) {
        // Return the highest priority rule's parameters
        const sortedEvents = results.events.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        return {
          success: true,
          events: sortedEvents,
          primaryEvent: sortedEvents[0],
          params: sortedEvents[0].params || {}
        };
      }
      
      return {
        success: false,
        events: [],
        primaryEvent: null,
        params: {}
      };
    } catch (error) {
      console.error('Error executing maintenance rules engine:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        primaryEvent: null,
        params: {}
      };
    }
  }

  /**
   * Get maintenance ticket status update rules
   * @param {Object} facts - Facts about the ticket and action
   * @returns {Promise<Object>} Status update parameters
   */
  async getStatusUpdateRules(facts) {
    const results = await this.executeMaintenanceRules(facts);
    
    if (results.success && results.primaryEvent) {
      return results.params;
    }
    
    return null;
  }

  /**
   * Check if an action should be blocked by business rules
   * @param {Object} facts - Facts about the action
   * @returns {Promise<boolean>} True if action should be blocked
   */
  async shouldBlockAction(facts) {
    const results = await this.executeMaintenanceRules(facts);
    
    if (results.success && results.primaryEvent) {
      return results.params.blockAction === true;
    }
    
    return false;
  }

  /**
   * Add a custom rule to the maintenance engine
   * @param {Object} rule - Rule definition
   */
  addMaintenanceRule(rule) {
    this.engines.maintenance.addRule(rule);
  }

  /**
   * Remove a rule from the maintenance engine
   * @param {Object} rule - Rule to remove
   */
  removeMaintenanceRule(rule) {
    this.engines.maintenance.removeRule(rule);
  }

  /**
   * Get formatting rules for postal/zip code
   * @param {Object} facts - Facts about the field (fieldType, country, etc.)
   * @returns {Promise<Object>} Formatting parameters
   */
  async getPostalCodeFormatRules(facts) {
    const engine = this.engines.postalCode;
    
    try {
      const results = await engine.run(facts);
      
      if (results.events.length > 0) {
        const sortedEvents = results.events.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        return sortedEvents[0].params;
      }
      
      return null;
    } catch (error) {
      console.error('Error executing postal code rules engine:', error);
      return null;
    }
  }

  /**
   * Format postal/zip code according to rules
   * @param {string} value - The value to format
   * @param {Object} facts - Facts about the field (country, fieldType)
   * @returns {Promise<string>} Formatted postal/zip code
   */
  async formatPostalCode(value, facts = {}) {
    const rules = await this.getPostalCodeFormatRules({
      fieldType: 'postal-code',
      ...facts
    });
    
    if (!value || !rules) return value;
    
    if (facts.country === 'CA') {
      // Canadian postal code: XXX XXX
      const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      } else {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
      }
    } else if (facts.country === 'US') {
      // US zip code: XXXXX or XXXXX-XXXX
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 5) {
        return cleaned;
      } else {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
      }
    }
    
    return value;
  }

  /**
   * Get formatting rules for phone number
   * @param {Object} facts - Facts about the field
   * @returns {Promise<Object>} Formatting parameters
   */
  async getPhoneNumberFormatRules(facts) {
    const engine = this.engines.phoneNumber;
    
    try {
      const results = await engine.run(facts);
      
      if (results.events.length > 0) {
        const sortedEvents = results.events.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        return sortedEvents[0].params;
      }
      
      return null;
    } catch (error) {
      console.error('Error executing phone number rules engine:', error);
      return null;
    }
  }

  /**
   * Format phone number according to rules
   * @param {string} value - The value to format
   * @param {Object} facts - Facts about the field
   * @returns {Promise<string>} Formatted phone number
   */
  async formatPhoneNumber(value, facts = {}) {
    const rules = await this.getPhoneNumberFormatRules({
      fieldType: 'phone',
      ...facts
    });
    
    if (!value || !rules) return value;
    
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format as (XXX)XXX-XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)})${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)})${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  }

  /**
   * Add a custom rule to the postal code engine
   * @param {Object} rule - Rule definition
   */
  addPostalCodeRule(rule) {
    this.engines.postalCode.addRule(rule);
  }

  /**
   * Remove a rule from the postal code engine
   * @param {Object} rule - Rule to remove
   */
  removePostalCodeRule(rule) {
    this.engines.postalCode.removeRule(rule);
  }

  /**
   * Add a custom rule to the phone number engine
   * @param {Object} rule - Rule definition
   */
  addPhoneNumberRule(rule) {
    this.engines.phoneNumber.addRule(rule);
  }

  /**
   * Remove a rule from the phone number engine
   * @param {Object} rule - Rule to remove
   */
  removePhoneNumberRule(rule) {
    this.engines.phoneNumber.removeRule(rule);
  }
}

// Export singleton instance (lazy initialization for client-side)
let rulesEngineInstance = null;

function getRulesEngine() {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    // Server-side: return a minimal mock that won't crash
    return {
      engines: {},
      getCurrencyFormatRules: async () => ({ useThousandsSeparator: true, separator: ',' }),
      formatCurrency: (amount) => {
        if (typeof amount === 'number') {
          return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return String(amount || '0.00');
      },
      formatPostalCode: (code) => code || '',
      formatPhoneNumber: (phone) => phone || '',
      executeMaintenanceRules: async () => ({ allowed: true }),
      getStatusUpdateRules: async () => ({}),
      shouldBlockAction: async () => false,
    };
  }
  
  // Client-side: lazy initialization
  if (!rulesEngineInstance) {
    try {
      rulesEngineInstance = new RulesEngineManager();
    } catch (error) {
      console.error('[Rules Engine] Initialization error:', error);
      // Return a minimal instance that won't crash
      rulesEngineInstance = {
        engines: {},
        getCurrencyFormatRules: async () => ({ useThousandsSeparator: true, separator: ',' }),
        formatCurrency: (amount) => {
          if (typeof amount === 'number') {
            return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
          return String(amount || '0.00');
        },
        formatPostalCode: (code) => code || '',
        formatPhoneNumber: (phone) => phone || '',
        executeMaintenanceRules: async () => ({ allowed: true }),
        getStatusUpdateRules: async () => ({}),
        shouldBlockAction: async () => false,
      };
    }
  }
  return rulesEngineInstance;
}

// Export getter function instead of calling it immediately
module.exports = new Proxy({}, {
  get(target, prop) {
    const engine = getRulesEngine();
    return engine[prop];
  }
});

