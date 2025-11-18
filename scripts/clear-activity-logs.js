const { prisma } = require('@/lib/prisma');

async function clearActivityLogs() {
  try {
    console.log('Connecting to database...');
    const result = await prisma.activityLog.deleteMany({});
    console.log(`✅ Successfully deleted ${result.count} activity log entries`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing activity logs:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearActivityLogs();

