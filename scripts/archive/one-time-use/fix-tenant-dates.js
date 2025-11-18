/**
 * Fix Tenant Dates - Correct UTC Timezone Issues
 * 
 * This script fixes existing tenant records that may have dates
 * shifted by one day due to UTC timezone conversion issues.
 * 
 * It updates:
 * - dateOfBirth
 * - moveInDate
 * 
 * The script preserves the date as it should be displayed (local date),
 * correcting any UTC conversion shifts.
 * 
 * Usage:
 *   node scripts/fix-tenant-dates.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a Date object at local midnight from a date string (YYYY-MM-DD)
 * This prevents timezone shifts when saving dates to the database
 */
function createDateAtLocalMidnight(dateString) {
  if (!dateString) return null;
  
  try {
    // Parse YYYY-MM-DD format
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      return null;
    }
    
    const [year, month, day] = parts.map(Number);
    
    // Validate date components
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }
    
    // Create date at local midnight (not UTC) to preserve the date as entered
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  } catch (error) {
    console.error('Error creating date:', error);
    return null;
  }
}

/**
 * Extract date components from a Date object and return as YYYY-MM-DD string
 * Uses LOCAL date components to preserve the date
 */
function formatDateString(date) {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

/**
 * Fix a date that may have been shifted by UTC conversion
 * 
 * The issue: If a date was stored as UTC midnight (e.g., "2024-11-01T00:00:00Z"),
 * and the server is in a timezone behind UTC, when we read it back, it shows
 * as the previous day in local time.
 * 
 * Solution: Extract the date components from the stored date and recreate
 * it at local midnight to preserve the intended date.
 */
function fixDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    
    // Check both UTC and local date components
    // If they differ, the date was likely stored with UTC conversion
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();
    
    const localYear = date.getFullYear();
    const localMonth = date.getMonth() + 1;
    const localDay = date.getDate();
    
    // If UTC and local dates differ, use UTC (the stored date) and convert to local
    // This corrects dates that were shifted when stored
    let year, month, day;
    
    if (utcYear !== localYear || utcMonth !== localMonth || utcDay !== localDay) {
      // Date was stored with UTC conversion - use UTC components
      console.log(`    UTC shift detected: UTC ${utcYear}-${String(utcMonth).padStart(2, '0')}-${String(utcDay).padStart(2, '0')} vs Local ${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`);
      year = utcYear;
      month = utcMonth;
      day = utcDay;
    } else {
      // No shift detected, use local components
      year = localYear;
      month = localMonth;
      day = localDay;
    }
    
    // Recreate at local midnight to ensure consistency
    return createDateAtLocalMidnight(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  } catch (error) {
    console.error('Error fixing date:', error);
    return null;
  }
}

async function fixTenantDates() {
  console.log('🔧 Starting tenant date fix...\n');
  
  try {
    // Get all tenants with dates
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { dateOfBirth: { not: null } },
          { moveInDate: { not: null } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        moveInDate: true,
      },
    });
    
    console.log(`Found ${tenants.length} tenants with dates to check\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const tenant of tenants) {
      const updates = {};
      let needsUpdate = false;
      
      // Fix dateOfBirth if present
      if (tenant.dateOfBirth) {
        const fixedDate = fixDate(tenant.dateOfBirth);
        if (fixedDate) {
          const originalStr = formatDateString(tenant.dateOfBirth);
          const fixedStr = formatDateString(fixedDate);
          
          // Always update to ensure dates are stored at local midnight
          // This prevents future timezone issues
          updates.dateOfBirth = fixedDate;
          needsUpdate = true;
          if (originalStr !== fixedStr) {
            console.log(`  ${tenant.firstName} ${tenant.lastName}: dateOfBirth ${originalStr} → ${fixedStr} (corrected)`);
          } else {
            console.log(`  ${tenant.firstName} ${tenant.lastName}: dateOfBirth ${originalStr} (normalized to local midnight)`);
          }
        }
      }
      
      // Fix moveInDate if present
      if (tenant.moveInDate) {
        const fixedDate = fixDate(tenant.moveInDate);
        if (fixedDate) {
          const originalStr = formatDateString(tenant.moveInDate);
          const fixedStr = formatDateString(fixedDate);
          
          // Always update to ensure dates are stored at local midnight
          // This prevents future timezone issues
          updates.moveInDate = fixedDate;
          needsUpdate = true;
          if (originalStr !== fixedStr) {
            console.log(`  ${tenant.firstName} ${tenant.lastName}: moveInDate ${originalStr} → ${fixedStr} (corrected)`);
          } else {
            console.log(`  ${tenant.firstName} ${tenant.lastName}: moveInDate ${originalStr} (normalized to local midnight)`);
          }
        }
      }
      
      if (needsUpdate) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: updates,
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Date fix complete!`);
    console.log(`   Updated: ${updatedCount} tenants`);
    console.log(`   Skipped: ${skippedCount} tenants (no changes needed)`);
    
  } catch (error) {
    console.error('❌ Error fixing tenant dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixTenantDates()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

