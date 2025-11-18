/**
 * Script to clear all tenant invitation records
 * Usage: node scripts/clear-invitations.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearInvitations() {
  try {
    console.log('🔍 Checking for tenant invitations...');
    
    const count = await prisma.tenantInvitation.count();
    
    if (count === 0) {
      console.log('✅ No invitations found in database');
      return;
    }

    console.log(`📋 Found ${count} invitation(s)`);
    
    // Delete all invitations
    const result = await prisma.tenantInvitation.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} invitation(s)`);
    console.log('');
    console.log('💡 You can now send a new invitation and test the flow');
  } catch (error) {
    console.error('❌ Error clearing invitations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearInvitations();

