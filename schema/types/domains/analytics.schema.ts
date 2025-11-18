import { z } from 'zod';
import { cuidSchema, optionalString } from '../base';

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
}).refine(data => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "Start date must be before end date",
  path: ["endDate"],
});

// Property Performance Query Schema
export const propertyPerformanceQuerySchema = dateRangeSchema.safeExtend({
  propertyId: cuidSchema,
});

// Portfolio Performance Query Schema
export const portfolioPerformanceQuerySchema = dateRangeSchema.safeExtend({
  landlordId: cuidSchema.optional(), // For PMC, optional to specify landlord
});

// Tenant Delinquency Risk Query Schema
export const tenantDelinquencyRiskQuerySchema = dateRangeSchema.safeExtend({
  landlordId: cuidSchema.optional(), // For PMC, optional to specify landlord
});

// Cash Flow Forecast Query Schema
export const cashFlowForecastQuerySchema = dateRangeSchema.safeExtend({
  landlordId: cuidSchema.optional(), // For PMC, optional to specify landlord
  months: z.string().transform(Number).pipe(z.number().int().min(1).max(24)).optional().default(12),
});

// Analytics Export Query Schema
export const analyticsExportQuerySchema = dateRangeSchema.safeExtend({
  format: z.enum(['csv', 'json', 'xlsx']).optional().default('csv'),
  type: z.enum(['property', 'portfolio', 'tenant', 'cashflow']).optional(),
  landlordId: cuidSchema.optional(),
  propertyId: cuidSchema.optional(),
});

// Close Period Validation Schema
export const validatePeriodSchema = z.object({
  periodId: z.string().min(1, 'Period ID is required'),
});

// Close Period Schema
export const closePeriodSchema = z.object({
  periodId: z.string().min(1, 'Period ID is required'),
});

// Generate T776 Schema
export const generateT776Schema = z.object({
  landlordId: z.string().optional(),
  taxYear: z.string().or(z.number()).refine((val) => {
    const year = typeof val === 'string' ? parseInt(val) : val;
    const currentYear = new Date().getFullYear();
    return year >= 2000 && year <= currentYear;
  }, {
    message: `Tax year must be between 2000 and ${new Date().getFullYear()}`,
  }),
  propertyIds: z.array(z.string()).optional(),
});

// Property Performance Response Schema
export const propertyPerformanceResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    propertyId: cuidSchema,
    propertyName: optionalString,
    address: z.string(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      days: z.number(),
    }),
    totalRent: z.number(),
    totalExpenses: z.number(),
    netIncome: z.number(),
    occupancyRate: z.number(),
    rentCollectionRate: z.number(),
    averageRent: z.number(),
    monthlyBreakdown: z.array(z.object({
      month: z.string(),
      rent: z.number(),
      expenses: z.number(),
      netIncome: z.number(),
    })),
  }),
});

// Portfolio Performance Response Schema
export const portfolioPerformanceResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    landlordId: cuidSchema.optional().nullable(),
    totalProperties: z.number(),
    totalRent: z.number(),
    totalExpenses: z.number(),
    netIncome: z.number(),
    occupancyRate: z.number(),
    occupiedUnits: z.number(),
    totalUnits: z.number(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      days: z.number(),
    }),
  }),
});

// Tenant Delinquency Risk Response Schema
export const tenantDelinquencyRiskResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    tenantId: cuidSchema,
    tenantName: z.string(),
    propertyAddress: z.string(),
    currentBalance: z.number(),
    daysPastDue: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    lastPaymentDate: z.string().datetime().nullable(),
    paymentHistory: z.array(z.object({
      date: z.string().datetime(),
      amount: z.number(),
      status: z.string(),
    })),
  })),
});

// Cash Flow Forecast Response Schema
export const cashFlowForecastResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    landlordId: cuidSchema.optional().nullable(),
    forecastPeriod: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      months: z.number(),
    }),
    monthlyForecast: z.array(z.object({
      month: z.string(),
      projectedIncome: z.number(),
      projectedExpenses: z.number(),
      projectedNet: z.number(),
      confidence: z.enum(['high', 'medium', 'low']),
    })),
    totalProjectedIncome: z.number(),
    totalProjectedExpenses: z.number(),
    totalProjectedNet: z.number(),
  }),
});

// Type exports
export type PropertyPerformanceQuery = z.infer<typeof propertyPerformanceQuerySchema>;
export type PortfolioPerformanceQuery = z.infer<typeof portfolioPerformanceQuerySchema>;
export type TenantDelinquencyRiskQuery = z.infer<typeof tenantDelinquencyRiskQuerySchema>;
export type CashFlowForecastQuery = z.infer<typeof cashFlowForecastQuerySchema>;
export type AnalyticsExportQuery = z.infer<typeof analyticsExportQuerySchema>;

