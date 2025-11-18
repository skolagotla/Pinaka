const { prisma } = require('@/lib/prisma');

async function updateActivityLogDescriptions() {
  try {
    console.log('Fetching all activity logs...');
    const activities = await prisma.activityLog.findMany({
      where: {
        entityType: 'property',
        action: 'update'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${activities.length} property update activities to process`);

    let updated = 0;
    for (const activity of activities) {
      try {
        // Parse existing description
        if (!activity.description || !activity.description.includes('updated')) {
          continue;
        }

        // Extract property name from description
        const propertyNameMatch = activity.description.match(/property\s+"([^"]+)"/);
        if (!propertyNameMatch) continue;

        const propertyName = propertyNameMatch[1];
        let newDescription = '';

        // Check if we have metadata with fieldChanges
        if (activity.metadata && activity.metadata.fieldChanges) {
          const fieldChanges = activity.metadata.fieldChanges;
          const changeDescriptions = fieldChanges.map(change => {
            if (change.unit) {
              // Unit field change - format based on unit count
              // For now, just use property name (we'd need to check unit count from property)
              return `${change.field}: "${change.oldValue}" → "${change.newValue}"`;
            } else {
              // Property field change
              return `${change.field}: "${change.oldValue}" → "${change.newValue}"`;
            }
          });
          newDescription = `Updated "${propertyName}" property - ${changeDescriptions.join('; ')}`;
        } else if (activity.metadata && activity.metadata.changedFields) {
          // Fallback for old format
          const fieldNames = Array.isArray(activity.metadata.changedFields)
            ? activity.metadata.changedFields.join(', ')
            : Object.keys(activity.metadata.changedFields).join(', ');
          newDescription = `Updated "${propertyName}" property - Changed: ${fieldNames}`;
        } else {
          // Simple format if no metadata
          newDescription = `Updated "${propertyName}" property`;
        }

        // Update the description
        await prisma.activityLog.update({
          where: { id: activity.id },
          data: { description: newDescription }
        });

        updated++;
      } catch (error) {
        console.error(`Error updating activity ${activity.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully updated ${updated} activity log descriptions`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error updating activity logs:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateActivityLogDescriptions();

