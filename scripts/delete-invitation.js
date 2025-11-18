/**
 * Script to delete tenant invitation records
 * Usage: node scripts/delete-invitation.js [email]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteInvitation(email) {
  try {
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/delete-invitation.js <email>');
      process.exit(1);
    }

    console.log(`🔍 Searching for invitations for: ${email}`);
    
    const invitations = await prisma.tenantInvitation.findMany({
      where: {
        email: email
      }
    });

    if (invitations.length === 0) {
      console.log('✅ No invitations found for this email');
      return;
    }

    console.log(`📋 Found ${invitations.length} invitation(s):`);
    invitations.forEach(inv => {
      console.log(`   - ID: ${inv.id}, Status: ${inv.status}, Created: ${inv.createdAt}`);
    });

    // Delete all invitations for this email
    const result = await prisma.tenantInvitation.deleteMany({
      where: {
        email: email
      }
    });

    console.log(`✅ Deleted ${result.count} invitation(s) for ${email}`);
  } catch (error) {
    console.error('❌ Error deleting invitation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
deleteInvitation(email);

