/**
 * Clean up all documents from document vault
 * Deletes:
 * 1. All Document records (tenant personal documents)
 * 2. All LeaseDocument records (lease agreements)
 * 3. All physical files from storage
 */

const { prisma } = require('@/lib/prisma');
const fs = require('fs');
const path = require('path');

async function cleanupAllDocuments() {
  console.log('🧹 Starting document vault cleanup...\n');

  try {
    // 1. Get all Document records
    const documents = await prisma.document.findMany({
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(`📄 Found ${documents.length} tenant documents`);

    // 2. Get all LeaseDocument records
    const leaseDocuments = await prisma.leaseDocument.findMany({
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    console.log(`📑 Found ${leaseDocuments.length} lease documents`);

    // 3. Delete physical files for tenant documents
    let deletedFiles = 0;
    let failedFiles = 0;

    console.log('\n🗑️  Deleting tenant document files...');
    for (const doc of documents) {
      try {
        const filePath = path.join(process.cwd(), doc.storagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles++;
          console.log(`   ✓ Deleted: ${doc.fileName} (${doc.tenant.firstName} ${doc.tenant.lastName})`);
        } else {
          console.log(`   ⚠️  File not found: ${doc.fileName}`);
        }
      } catch (error) {
        failedFiles++;
        console.error(`   ✗ Error deleting ${doc.fileName}:`, error.message);
      }
    }

    // 4. Delete physical files for lease documents
    console.log('\n🗑️  Deleting lease document files...');
    for (const doc of leaseDocuments) {
      try {
        const filePath = path.join(process.cwd(), doc.storagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles++;
          console.log(`   ✓ Deleted: ${doc.fileName} (Lease document)`);
        } else {
          console.log(`   ⚠️  File not found: ${doc.fileName}`);
        }
      } catch (error) {
        failedFiles++;
        console.error(`   ✗ Error deleting ${doc.fileName}:`, error.message);
      }
    }

    // 5. Delete all Document records from database
    console.log('\n🗄️  Deleting database records...');
    const deletedDocuments = await prisma.document.deleteMany({});
    console.log(`   ✓ Deleted ${deletedDocuments.count} Document records`);

    // 6. Delete all LeaseDocument records from database
    const deletedLeaseDocuments = await prisma.leaseDocument.deleteMany({});
    console.log(`   ✓ Deleted ${deletedLeaseDocuments.count} LeaseDocument records`);

    // 7. Clean up uploads directory (optional - if completely empty)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const documentsDir = path.join(uploadsDir, 'documents');
    const leaseDocsDir = path.join(uploadsDir, 'lease-documents');

    // Check if directories are empty and remove if they are
    if (fs.existsSync(documentsDir)) {
      const files = fs.readdirSync(documentsDir);
      if (files.length === 0) {
        fs.rmdirSync(documentsDir);
        console.log('   ✓ Removed empty documents directory');
      } else {
        console.log(`   ⚠️  Documents directory still has ${files.length} files`);
      }
    }

    if (fs.existsSync(leaseDocsDir)) {
      const files = fs.readdirSync(leaseDocsDir);
      if (files.length === 0) {
        fs.rmdirSync(leaseDocsDir);
        console.log('   ✓ Removed empty lease-documents directory');
      } else {
        console.log(`   ⚠️  Lease-documents directory still has ${files.length} files`);
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CLEANUP SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Total files deleted: ${deletedFiles}`);
    console.log(`❌ Failed deletions: ${failedFiles}`);
    console.log(`🗄️  Database records deleted: ${deletedDocuments.count + deletedLeaseDocuments.count}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Document vault cleanup completed!\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupAllDocuments()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

