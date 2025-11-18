/**
 * Change Description Builder
 * 
 * Simplifies building change descriptions from field and unit changes
 */

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface UnitFieldChange {
  unit: string;
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Build change description from field and unit changes
 */
export function buildChangeDescription(
  entityName: string,
  fieldChanges: FieldChange[],
  unitFieldChanges: UnitFieldChange[],
  unitCount: number = 1
): string {
  const allChanges = [...fieldChanges, ...unitFieldChanges];
  
  if (allChanges.length === 0) {
    return `Updated "${entityName}" property`;
  }

  // Determine display name for unit changes
  let displayName = entityName;
  if (unitFieldChanges.length > 0 && unitCount > 1) {
    const firstUnitChange = unitFieldChanges[0];
    const unitNumberMatch = firstUnitChange.unit.match(/(\d+)/);
    if (unitNumberMatch) {
      const unitNumber = unitNumberMatch[1];
      displayName = `${unitNumber} ${entityName}`;
    }
  } else if (unitFieldChanges.length > 0) {
    displayName = entityName; // Single unit property
  }

  // Build change descriptions
  const changeDescriptions: string[] = [];
  
  for (const change of allChanges) {
    if (!change || typeof change !== 'object') {
      continue;
    }

    const fieldName = change.field;
    if (!fieldName || typeof fieldName !== 'string') {
      continue;
    }

    // Format values
    const formatValue = (val: any): string => {
      if (val === null || val === undefined || val === '') {
        return '(empty)';
      }
      return String(val);
    };

    const oldVal = formatValue(change.oldValue);
    const newVal = formatValue(change.newValue);
    
    changeDescriptions.push(`${fieldName}: "${oldVal}" → "${newVal}"`);
  }

  if (changeDescriptions.length > 0) {
    return `Updated "${displayName}" property - ${changeDescriptions.join('; ')}`;
  }

  return `Updated "${displayName}" property`;
}

