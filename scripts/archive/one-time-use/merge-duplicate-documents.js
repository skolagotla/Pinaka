/**
 * Merge Duplicate Documents Script
 * 
 * This script finds cases where tenants have multiple documents for the same category
 * and merges them into a single document with version history.
 * 
 * Selection Logic (Priority Order):
 * 1. Most recently uploaded document becomes the current version
 * 2. All older documents are added to version history
 * 3. Deleted documents are excluded from consideration
 * 
 * Usage:
 *   node scripts/merge-duplicate-documents.js
 */

const { prisma } = require('@/lib/prisma');

// Selection logic: Choose which document should be the "current" version
function selectCurrentDocument(documents) {
  // Filter out deleted documents
  const activeDocs = documents.filter(doc => !doc.isDeleted);
  
  if (activeDocs.length === 0) {
    console.log('   ⚠️  All documents are deleted, skipping...');
    return null;
  }
  
  if (activeDocs.length === 1) {
    console.log('   ℹ️  Only one active document, nothing to merge');
    return null;
  }
  
  // Priority 1: Most recently uploaded (latest uploadedAt)
  const sortedByDate = [...activeDocs].sort((a, b) => 
    new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
  
  const current = sortedByDate[0];
  const oldVersions = sortedByDate.slice(1);
  
  console.log(`   ✓ Selected: ${current.originalName} (${new Date(current.uploadedAt).toLocaleString()})`);
  console.log(`   → Merging ${oldVersions.length} older version(s) into history`);
  
  return {
    current,
    oldVersions
  };
}

// Merge documents for a specific tenant/category
async function mergeDuplicatesForCategory(tenantId, category, documents) {
  const selection = selectCurrentDocument(documents);
  
  if (!selection) {
    return false; // Nothing to merge
  }
  
  const { current, oldVersions } = selection;
  
  try {
    // Parse existing metadata if any
    let existingVersions = [];
    if (current.metadata) {
      try {
        const metadata = JSON.parse(current.metadata);
        if (metadata.versions) {
          existingVersions = metadata.versions;
        }
      } catch (e) {
        console.log('   ⚠️  Could not parse existing metadata');
      }
    }
    
    // Add old documents to version history
    const newVersions = oldVersions.map(doc => ({
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      storagePath: doc.storagePath,
      uploadedBy: doc.uploadedBy,
      uploadedByEmail: doc.uploadedByEmail,
      uploadedByName: doc.uploadedByName,
      uploadedAt: doc.uploadedAt.toISOString(),
    }));
    
    // Combine with existing versions (newest to oldest)
    const allVersions = [...newVersions, ...existingVersions];
    
    const metadata = {
      versions: allVersions,
      fileCount: allVersions.length + 1 // +1 for current
    };
    
    // Update current document with version history
    await prisma.document.update({
      where: { id: current.id },
      data: {
        metadata: JSON.stringify(metadata),
        updatedAt: new Date()
      }
    });
    
    // Mark old documents as deleted
    for (const oldDoc of oldVersions) {
      await prisma.document.update({
        where: { id: oldDoc.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: 'system',
          deletedByEmail: 'system@merge',
          deletedByName: 'System Merge',
          deletionReason: 'Merged into version history of document ' + current.id,
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`   ✅ Merged successfully! Total versions: ${metadata.fileCount}`);
    return true;
  } catch (error) {
    console.error('   ❌ Error merging:', error.message);
    return false;
  }
}

// Main function
async function mergeDuplicateDocuments() {
  console.log('🔍 Scanning for duplicate documents...\n');
  
  try {
    // Get all active documents grouped by tenant and category
    const documents = await prisma.document.findMany({
      where: {
        isDeleted: false
      },
      orderBy: [
        { tenantId: 'asc' },
        { category: 'asc' },
        { uploadedAt: 'desc' }
      ]
    });
    
    // Group by tenant + category
    const grouped = {};
    documents.forEach(doc => {
      const key = `${doc.tenantId}:${doc.category}`;
      if (!grouped[key]) {
        grouped[key] = {
          tenantId: doc.tenantId,
          category: doc.category,
          documents: []
        };
      }
      grouped[key].documents.push(doc);
    });
    
    // Find duplicates
    const duplicates = Object.values(grouped).filter(g => g.documents.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✨ No duplicate documents found! All documents are unique.\n');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`📋 Found ${duplicates.length} case(s) with duplicate documents:\n`);
    
    let mergedCount = 0;
    
    for (const dup of duplicates) {
      console.log(`📄 Tenant: ${dup.tenantId.substring(0, 12)}... | Category: ${dup.category}`);
      console.log(`   Found ${dup.documents.length} documents:`);
      
      dup.documents.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.originalName} (${new Date(doc.uploadedAt).toLocaleString()})`);
      });
      
      const merged = await mergeDuplicatesForCategory(
        dup.tenantId,
        dup.category,
        dup.documents
      );
      
      if (merged) {
        mergedCount++;
      }
      
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Merge complete!`);
    console.log(`   - Total duplicates found: ${duplicates.length}`);
    console.log(`   - Successfully merged: ${mergedCount}`);
    console.log(`   - Skipped: ${duplicates.length - mergedCount}`);
    console.log('═══════════════════════════════════════════════\n');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
mergeDuplicateDocuments();

