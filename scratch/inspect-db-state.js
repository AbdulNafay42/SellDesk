const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDb() {
  console.log('=== DATABASE INTEGRITY VERIFICATION ===');
  const customerCount = await prisma.customer.count();
  const conversationCount = await prisma.conversation.count();
  const messageCount = await prisma.message.count();

  console.log(`Total Customers: ${customerCount}`);
  console.log(`Total Conversations: ${conversationCount}`);
  console.log(`Total Messages: ${messageCount}`);

  // Check composite uniqueness violations (if any)
  const duplicateMessages = await prisma.$queryRaw`
    SELECT "businessId", "externalMessageId", COUNT(*) 
    FROM "Message" 
    WHERE "externalMessageId" IS NOT NULL 
    GROUP BY "businessId", "externalMessageId" 
    HAVING COUNT(*) > 1
  `;

  const duplicateConversations = await prisma.$queryRaw`
    SELECT "businessId", "channel", "externalContactId", COUNT(*) 
    FROM "Conversation" 
    GROUP BY "businessId", "channel", "externalContactId" 
    HAVING COUNT(*) > 1
  `;

  console.log(`Duplicate Messages (by wamid): ${duplicateMessages.length}`);
  console.log(`Duplicate Conversations (by channel+contact): ${duplicateConversations.length}`);

  const sampleMessages = await prisma.message.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      businessId: true,
      externalMessageId: true,
      direction: true,
      type: true,
      text: true,
      status: true,
    },
  });

  console.log('Sample Recent Messages:', JSON.stringify(sampleMessages, null, 2));

  await prisma.$disconnect();
}

inspectDb().catch((err) => {
  console.error(err);
  prisma.$disconnect();
});
