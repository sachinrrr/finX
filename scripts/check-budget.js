const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkBudget() {
  const budget = await prisma.budget.findFirst({
    include: { user: true },
  });
  
  const account = await prisma.account.findFirst({
    where: {
      name: {
        contains: "My Wallet",
        mode: "insensitive",
      },
    },
  });
  
  console.log("Budget:", budget);
  console.log("Account:", account);
}

checkBudget()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
