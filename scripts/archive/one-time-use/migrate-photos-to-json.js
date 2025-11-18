const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePhotosToJson() {
  try {
    console.log('Starting migration: Converting photos from String[] to Json...');
    
    // Get all inspection checklist items with photos
    const items = await prisma.inspectionChecklistItem.findMany({
      where: {
        photos: {
          not: null
        }
      }
    });

    console.log(`Found ${items.length} items with photos to migrate`);

    for (const item of items) {
      // Check if photos is already in new format (object with url property)
      if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
        // Check if first element is a string (old format) or object (new format)
        if (typeof item.photos[0] === 'string') {
          // Convert string array to object array
          const photoObjects = item.photos.map(url => ({
            url: url,
            comment: null
          }));

          console.log(`Migrating item ${item.id}: ${item.photos.length} photos`);

          // Update the item with new format
          await prisma.inspectionChecklistItem.update({
            where: { id: item.id },
            data: {
              photos: photoObjects
            }
          });
        } else {
          console.log(`Item ${item.id} already in new format, skipping`);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migratePhotosToJson();

