/**
 * Property Update Helpers
 * 
 * Extracted validation and unit handling logic from the main property update endpoint
 * to improve maintainability and testability.
 */

// Note: prisma is passed as transaction client (tx) parameter, not imported
import { diffPropertyFields, PROPERTY_FIELD_MAP } from './property-field-mapper';

export interface PropertyUpdateData {
  propertyName?: string;
  addressLine1?: string;
  city?: string;
  postalZip?: string;
  provinceState?: string;
  country?: string;
  countryCode?: string;
  regionCode?: string;
  propertyType?: string;
  unitCount?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  mortgageAmount?: number;
  interestRate?: number;
  mortgageTermYears?: number;
  mortgageStartDate?: string;
  paymentFrequency?: string;
  squareFootage?: number;
  rented?: string;
  unitFinancials?: Array<{
    unitName?: string;
    unitNumber?: number;
    floorNumber?: number;
    bedrooms?: number;
    bathrooms?: number;
    rentPrice?: number;
    depositAmount?: number;
    status?: string;
  }>;
}

export interface UnitFieldChange {
  unit: string;
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Validate property update data
 */
export function validatePropertyUpdate(data: PropertyUpdateData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate unitCount if provided
  if (data.unitCount !== undefined) {
    const unitCountNum = parseInt(String(data.unitCount));
    if (isNaN(unitCountNum) || unitCountNum < 1) {
      errors.push('Invalid unitCount. Must be a positive number.');
    }
  }

  // Validate unitFinancials if provided
  if (data.unitFinancials && Array.isArray(data.unitFinancials)) {
    data.unitFinancials.forEach((unit, index) => {
      if (!unit) {
        errors.push(`Invalid unit data at index ${index}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Update or create units for a property
 * Uses Promise.allSettled for parallel updates when possible
 */
export async function updateOrCreateUnits(
  tx: any, // Prisma transaction client
  propertyId: string,
  unitFinancials: Array<any>,
  existingUnits: Array<any>
): Promise<{
  unitFieldChanges: UnitFieldChange[];
  errors: Array<{ unit: string; error: string }>;
}> {
  const unitFieldChanges: UnitFieldChange[] = [];
  const errors: Array<{ unit: string; error: string }> = [];
  const crypto = require('crypto');

  // Process units in parallel where possible
  const updatePromises = unitFinancials.map(async (unitData, index) => {
    try {
      const unitName = unitData.unitName || (unitData.unitNumber ? `Unit ${unitData.unitNumber}` : `Unit ${index + 1}`);
      const existingUnit = existingUnits[index];

      // Track field changes
      const unitChanges: UnitFieldChange[] = [];

      if (existingUnit) {
        // Track changes for existing unit
        if (unitData.floorNumber !== null && unitData.floorNumber !== undefined && unitData.floorNumber !== existingUnit.floorNumber) {
          unitChanges.push({
            unit: unitName,
            field: 'Floor Number',
            oldValue: existingUnit.floorNumber || '(empty)',
            newValue: unitData.floorNumber,
          });
        }
        if (unitData.bedrooms !== null && unitData.bedrooms !== undefined && unitData.bedrooms !== existingUnit.bedrooms) {
          unitChanges.push({
            unit: unitName,
            field: 'Bedrooms',
            oldValue: existingUnit.bedrooms || '(empty)',
            newValue: unitData.bedrooms,
          });
        }
        if (unitData.bathrooms !== null && unitData.bathrooms !== undefined) {
          const oldBathrooms = existingUnit.bathrooms !== null ? parseFloat(String(existingUnit.bathrooms)) : null;
          const newBathrooms = parseFloat(String(unitData.bathrooms));
          if (oldBathrooms !== newBathrooms) {
            unitChanges.push({
              unit: unitName,
              field: 'Bathrooms',
              oldValue: existingUnit.bathrooms !== null && existingUnit.bathrooms !== undefined ? String(existingUnit.bathrooms) : '(empty)',
              newValue: unitData.bathrooms !== null && unitData.bathrooms !== undefined ? String(unitData.bathrooms) : '(empty)',
            });
          }
        }
        if (unitData.rentPrice !== null && unitData.rentPrice !== undefined && unitData.rentPrice !== existingUnit.rentPrice) {
          unitChanges.push({
            unit: unitName,
            field: 'Rent Price',
            oldValue: existingUnit.rentPrice ? `$${existingUnit.rentPrice.toLocaleString()}` : '(empty)',
            newValue: unitData.rentPrice ? `$${unitData.rentPrice.toLocaleString()}` : '(empty)',
          });
        }
        if (unitData.depositAmount !== null && unitData.depositAmount !== undefined && unitData.depositAmount !== existingUnit.depositAmount) {
          unitChanges.push({
            unit: unitName,
            field: 'Deposit Amount',
            oldValue: existingUnit.depositAmount ? `$${existingUnit.depositAmount.toLocaleString()}` : '(empty)',
            newValue: unitData.depositAmount ? `$${unitData.depositAmount.toLocaleString()}` : '(empty)',
          });
        }
        if (unitData.status && unitData.status !== existingUnit.status) {
          unitChanges.push({
            unit: unitName,
            field: 'Status',
            oldValue: existingUnit.status || '(empty)',
            newValue: unitData.status,
          });
        }

        // Build update data
        const updateData: any = {
          unitName: unitName,
          updatedAt: new Date(),
        };

        // BUG FIX: Validate parseInt/parseFloat results to prevent NaN values
        if (unitData.floorNumber !== null && unitData.floorNumber !== undefined) {
          const parsed = parseInt(String(unitData.floorNumber), 10);
          if (!isNaN(parsed)) {
            updateData.floorNumber = parsed;
          }
        }
        if (unitData.bedrooms !== null && unitData.bedrooms !== undefined) {
          const parsed = parseInt(String(unitData.bedrooms), 10);
          if (!isNaN(parsed)) {
            updateData.bedrooms = parsed;
          }
        }
        if (unitData.bathrooms !== null && unitData.bathrooms !== undefined) {
          const parsed = parseFloat(String(unitData.bathrooms));
          if (!isNaN(parsed)) {
            updateData.bathrooms = parsed;
          }
        }
        if (unitData.rentPrice !== null && unitData.rentPrice !== undefined) {
          const parsed = parseFloat(String(unitData.rentPrice));
          if (!isNaN(parsed) && parsed >= 0) {
            updateData.rentPrice = parsed;
          }
        }
        if (unitData.depositAmount !== null && unitData.depositAmount !== undefined) {
          const parsed = parseFloat(String(unitData.depositAmount));
          if (!isNaN(parsed) && parsed >= 0) {
            updateData.depositAmount = parsed;
          }
        }
        if (unitData.status) {
          updateData.status = unitData.status;
        }

        // Update existing unit
        await tx.unit.update({
          where: { id: existingUnit.id },
          data: updateData,
        });

        return { unitChanges, unitName };
      } else {
        // Create new unit
        const unitId = crypto.randomBytes(8).toString('hex');
        const unitCreateData: any = {
          id: unitId,
          propertyId: propertyId,
          unitName: unitName,
          status: unitData.status || "Vacant",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (unitData.floorNumber !== null && unitData.floorNumber !== undefined && unitData.floorNumber !== '') {
          const floorNum = parseInt(String(unitData.floorNumber));
          if (!isNaN(floorNum)) {
            unitCreateData.floorNumber = floorNum;
          }
        }
        if (unitData.bedrooms !== null && unitData.bedrooms !== undefined && unitData.bedrooms !== '') {
          const bedrooms = parseInt(String(unitData.bedrooms));
          if (!isNaN(bedrooms)) {
            unitCreateData.bedrooms = bedrooms;
          }
        }
        if (unitData.bathrooms !== null && unitData.bathrooms !== undefined && unitData.bathrooms !== '') {
          const bathrooms = parseFloat(String(unitData.bathrooms));
          if (!isNaN(bathrooms)) {
            unitCreateData.bathrooms = bathrooms;
          }
        }
        if (unitData.rentPrice !== null && unitData.rentPrice !== undefined && unitData.rentPrice !== '') {
          const rentPrice = parseFloat(String(unitData.rentPrice));
          if (!isNaN(rentPrice)) {
            unitCreateData.rentPrice = rentPrice;
          }
        }
        if (unitData.depositAmount !== null && unitData.depositAmount !== undefined && unitData.depositAmount !== '') {
          const depositAmount = parseFloat(String(unitData.depositAmount));
          if (!isNaN(depositAmount)) {
            unitCreateData.depositAmount = depositAmount;
          }
        }

        await tx.unit.create({
          data: unitCreateData,
        });

        return { unitChanges: [], unitName };
      }
    } catch (error: any) {
      const unitName = unitData.unitName || `Unit ${index + 1}`;
      errors.push({
        unit: unitName,
        error: error.message || 'Unknown error',
      });
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  });

  // Use Promise.allSettled to handle partial failures gracefully
  const results = await Promise.allSettled(updatePromises);

  // Collect successful changes and errors
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      unitFieldChanges.push(...result.value.unitChanges);
    } else {
      const unitName = unitFinancials[index]?.unitName || `Unit ${index + 1}`;
      errors.push({
        unit: unitName,
        error: result.reason?.message || 'Unknown error',
      });
    }
  });

  return { unitFieldChanges, errors };
}

/**
 * Handle single unit property update (backward compatibility)
 */
export async function updateSingleUnit(
  tx: any,
  propertyId: string,
  rent?: number,
  depositAmount?: number,
  rented?: string
): Promise<UnitFieldChange[]> {
  const unitFieldChanges: UnitFieldChange[] = [];
  const existingUnit = await tx.unit.findFirst({
    where: { propertyId },
  });

  if (existingUnit) {
    // Track changes
    if (rent !== undefined && rent !== existingUnit.rentPrice) {
      unitFieldChanges.push({
        unit: existingUnit.unitName || 'Unit 1',
        field: 'Rent Price',
        oldValue: existingUnit.rentPrice ? `$${existingUnit.rentPrice.toLocaleString()}` : '(empty)',
        newValue: rent ? `$${rent.toLocaleString()}` : '(empty)',
      });
    }
    if (depositAmount !== undefined && depositAmount !== existingUnit.depositAmount) {
      unitFieldChanges.push({
        unit: existingUnit.unitName || 'Unit 1',
        field: 'Deposit Amount',
        oldValue: existingUnit.depositAmount ? `$${existingUnit.depositAmount.toLocaleString()}` : '(empty)',
        newValue: depositAmount ? `$${depositAmount.toLocaleString()}` : '(empty)',
      });
    }
    const newStatus = rented === "No" ? "Vacant" : "Occupied";
    if (rented !== undefined && newStatus !== existingUnit.status) {
      unitFieldChanges.push({
        unit: existingUnit.unitName || 'Unit 1',
        field: 'Status',
        oldValue: existingUnit.status || '(empty)',
        newValue: newStatus,
      });
    }

    // Update existing unit
    await tx.unit.update({
      where: { id: existingUnit.id },
      data: {
        rentPrice: rent ? parseFloat(String(rent)) : null,
        depositAmount: depositAmount ? parseFloat(String(depositAmount)) : null,
        status: newStatus,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new unit
    const crypto = require('crypto');
    const unitId = crypto.randomBytes(8).toString('hex');
    await tx.unit.create({
      data: {
        id: unitId,
        propertyId: propertyId,
        unitName: "Unit 1",
        floorNumber: null,
        bedrooms: null,
        bathrooms: null,
        rentPrice: rent ? parseFloat(String(rent)) : null,
        depositAmount: depositAmount ? parseFloat(String(depositAmount)) : null,
        status: rented === "No" ? "Vacant" : "Occupied",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return unitFieldChanges;
}

