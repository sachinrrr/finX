const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate realistic random times based on transaction type/category
function getRealisticTime(category, type) {
  // Different categories have different typical transaction times
  const timeRanges = {
    // Morning transactions (6 AM - 11 AM)
    groceries: { minHour: 8, maxHour: 20 },
    food: { minHour: 7, maxHour: 22 },
    transportation: { minHour: 6, maxHour: 21 },
    
    // Business hours (9 AM - 6 PM)
    utilities: { minHour: 9, maxHour: 17 },
    healthcare: { minHour: 8, maxHour: 18 },
    education: { minHour: 9, maxHour: 21 },
    
    // Evening/flexible (varies)
    entertainment: { minHour: 10, maxHour: 23 },
    shopping: { minHour: 10, maxHour: 21 },
    personal: { minHour: 9, maxHour: 20 },
    
    // Income typically comes during business hours
    salary: { minHour: 9, maxHour: 17 },
    freelance: { minHour: 10, maxHour: 18 },
    investments: { minHour: 9, maxHour: 16 },
    business: { minHour: 9, maxHour: 18 },
    rental: { minHour: 10, maxHour: 17 },
    
    // Default
    default: { minHour: 8, maxHour: 21 }
  };

  const range = timeRanges[category] || timeRanges.default;
  const hour = randomBetween(range.minHour, range.maxHour);
  const minute = randomBetween(0, 59);
  const second = randomBetween(0, 59);

  return { hour, minute, second };
}

async function updateTransactionTimes() {
  console.log("Updating transaction times with realistic varied times...\n");

  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    select: {
      id: true,
      date: true,
      category: true,
      type: true,
      description: true,
    },
  });

  console.log(`Found ${transactions.length} transactions to update\n`);

  let updated = 0;
  for (const transaction of transactions) {
    const { hour, minute, second } = getRealisticTime(transaction.category, transaction.type);
    
    // Create new date with random time
    const newDate = new Date(transaction.date);
    newDate.setHours(hour, minute, second, 0);

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { date: newDate },
    });

    updated++;
    if (updated % 20 === 0) {
      console.log(`Updated ${updated}/${transactions.length} transactions...`);
    }
  }

  console.log(`\n✅ Successfully updated ${updated} transactions with varied times!`);
  
  // Show some examples
  const samples = await prisma.transaction.findMany({
    take: 10,
    orderBy: { date: 'desc' },
    select: {
      description: true,
      date: true,
      category: true,
    },
  });

  console.log("\nSample updated transactions:");
  console.log("-----------------------------");
  samples.forEach(t => {
    const time = t.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    console.log(`${t.category.padEnd(15)} | ${time.padEnd(10)} | ${t.description}`);
  });
}

updateTransactionTimes()
  .catch((e) => {
    console.error("Error updating transaction times:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
