const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetTransactions() {
  const account = await prisma.account.findFirst({
    where: {
      name: {
        contains: "My Wallet",
        mode: "insensitive",
      },
    },
  });

  if (!account) {
    console.log("Account not found");
    return;
  }

  console.log("Deleting transactions for account:", account.name);
  
  const deleted = await prisma.transaction.deleteMany({
    where: { accountId: account.id },
  });

  console.log(`Deleted ${deleted.count} transactions`);

  // Reset balance to a reasonable starting amount
  await prisma.account.update({
    where: { id: account.id },
    data: { balance: 84480.02 }, // Original balance from screenshot
  });

  console.log("Reset account balance to LKR 84,480.02");
}

resetTransactions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
