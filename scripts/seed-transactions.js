const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Realistic expense transaction templates (scaled for 50k monthly budget)
const expenseTransactions = [
  // Groceries (budget: ~8,000/month)
  { category: "groceries", description: "Weekly groceries - Keells Super", minAmount: 1500, maxAmount: 2500 },
  { category: "groceries", description: "Fresh vegetables - Pettah Market", minAmount: 400, maxAmount: 800 },
  { category: "groceries", description: "Fruits and dairy - Cargills Food City", minAmount: 500, maxAmount: 1000 },
  
  // Food & Dining (budget: ~6,000/month)
  { category: "food", description: "Lunch at office cafeteria", minAmount: 250, maxAmount: 450 },
  { category: "food", description: "Coffee at Java Lounge", minAmount: 350, maxAmount: 550 },
  { category: "food", description: "Dinner out - Pizza Hut", minAmount: 1500, maxAmount: 2500 },
  { category: "food", description: "Takeaway - Chinese Dragon", minAmount: 800, maxAmount: 1500 },
  
  // Transportation (budget: ~5,000/month)
  { category: "transportation", description: "Fuel - Ceylon Petroleum", minAmount: 2000, maxAmount: 3500 },
  { category: "transportation", description: "PickMe ride", minAmount: 350, maxAmount: 650 },
  { category: "transportation", description: "Bus fare", minAmount: 100, maxAmount: 250 },
  { category: "transportation", description: "Parking fee", minAmount: 100, maxAmount: 300 },
  
  // Utilities (budget: ~5,000/month - recurring)
  { category: "utilities", description: "CEB Electricity bill", minAmount: 2000, maxAmount: 3000, recurring: true },
  { category: "utilities", description: "Dialog home broadband", minAmount: 1500, maxAmount: 2000, recurring: true },
  { category: "utilities", description: "Mobitel mobile bill", minAmount: 800, maxAmount: 1200, recurring: true },
  { category: "utilities", description: "Water board bill", minAmount: 400, maxAmount: 800, recurring: true },
  
  // Entertainment (budget: ~3,000/month)
  { category: "entertainment", description: "Netflix subscription", minAmount: 1100, maxAmount: 1500, recurring: true },
  { category: "entertainment", description: "Spotify Premium", minAmount: 500, maxAmount: 700, recurring: true },
  { category: "entertainment", description: "Movie tickets - Scope Cinemas", minAmount: 1200, maxAmount: 1800 },
  
  // Shopping (budget: ~4,000/month)
  { category: "shopping", description: "Clothes - Fashion Bug", minAmount: 1500, maxAmount: 3000 },
  { category: "shopping", description: "Books - Vijitha Yapa", minAmount: 500, maxAmount: 1200 },
  { category: "shopping", description: "Household items", minAmount: 800, maxAmount: 1500 },
  
  // Healthcare (budget: ~2,000/month)
  { category: "healthcare", description: "Pharmacy - State Pharma", minAmount: 400, maxAmount: 1000 },
  { category: "healthcare", description: "Doctor visit", minAmount: 1500, maxAmount: 2500 },
  
  // Personal (budget: ~2,000/month)
  { category: "personal", description: "Haircut - Ramani Salon", minAmount: 500, maxAmount: 1000 },
  { category: "personal", description: "Personal care items", minAmount: 400, maxAmount: 800 },
  
  // Education (budget: ~2,000/month)
  { category: "education", description: "Online course - Udemy", minAmount: 1500, maxAmount: 2500 },
  
  // Gifts (occasional)
  { category: "gifts", description: "Birthday gift for friend", minAmount: 1000, maxAmount: 2000 },
];

const incomeTransactions = [
  { category: "salary", description: "Monthly salary - Tech Corp", amount: 65000 },
  { category: "freelance", description: "Web development project", minAmount: 8000, maxAmount: 15000 },
  { category: "freelance", description: "UI/UX design work", minAmount: 5000, maxAmount: 12000 },
  { category: "investments", description: "Fixed deposit interest", minAmount: 2000, maxAmount: 5000 },
  { category: "other-income", description: "Cashback reward", minAmount: 200, maxAmount: 800 },
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Add random time to a date (between 6:00 AM and 11:00 PM)
function addRandomTime(date) {
  const hour = randomBetween(6, 23);
  const minute = randomBetween(0, 59);
  const second = randomBetween(0, 59);
  date.setHours(hour, minute, second, 0);
  return date;
}

async function seedTransactions() {
  console.log("Starting transaction seed...");
  console.log("Budget-aware mode: Keeping monthly expenses within LKR 50,000");

  // Find the "My Wallet" account and budget
  const account = await prisma.account.findFirst({
    where: {
      name: { contains: "My Wallet", mode: "insensitive" },
    },
    include: { user: true },
  });

  if (!account) {
    console.error("Could not find 'My Wallet' account.");
    process.exit(1);
  }

  const budget = await prisma.budget.findFirst({
    where: { userId: account.userId },
  });

  const monthlyBudget = budget ? parseFloat(budget.amount) : 50000;
  console.log(`\nFound account: ${account.name}`);
  console.log(`User: ${account.user.email}`);
  console.log(`Current balance: LKR ${parseFloat(account.balance).toLocaleString()}`);
  console.log(`Monthly budget: LKR ${monthlyBudget.toLocaleString()}`);

  const userId = account.userId;
  const accountId = account.id;

  const now = new Date();
  const transactions = [];
  let totalIncome = 0;
  let totalExpense = 0;

  // Generate transactions for 3 months
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now);
    monthDate.setMonth(monthDate.getMonth() - monthOffset);
    const monthStart = getMonthStart(monthDate);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0); // Last day of month

    let monthExpense = 0;
    const targetExpense = monthlyBudget * 0.85; // Aim for 85% of budget

    console.log(`\n--- Month ${monthOffset === 0 ? '(Current)' : `-${monthOffset}`}: ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ---`);

    // 1. Add salary at end of previous month (income for this month)
    const salaryDate = new Date(monthStart);
    salaryDate.setDate(randomBetween(25, 28));
    if (salaryDate > now) salaryDate.setMonth(salaryDate.getMonth() - 1);
    addRandomTime(salaryDate);
    
    const salaryAmount = 65000;
    transactions.push({
      type: "INCOME",
      amount: salaryAmount,
      description: "Monthly salary - Tech Corp",
      date: salaryDate,
      category: "salary",
      isRecurring: true,
      recurringInterval: "MONTHLY",
      status: "COMPLETED",
      userId,
      accountId,
    });
    totalIncome += salaryAmount;

    // 2. Add recurring expenses (utilities, subscriptions)
    const recurringExpenses = expenseTransactions.filter(t => t.recurring);
    for (const template of recurringExpenses) {
      const amount = randomBetween(template.minAmount, template.maxAmount);
      const date = new Date(monthStart);
      date.setDate(randomBetween(5, 20));
      addRandomTime(date);
      if (date > now) continue;
      
      if (monthExpense + amount <= targetExpense) {
        transactions.push({
          type: "EXPENSE",
          amount,
          description: template.description,
          date,
          category: template.category,
          isRecurring: true,
          recurringInterval: "MONTHLY",
          status: "COMPLETED",
          userId,
          accountId,
        });
        monthExpense += amount;
        totalExpense += amount;
      }
    }

    // 3. Add variable expenses (groceries, food, transport, etc.)
    const variableExpenses = expenseTransactions.filter(t => !t.recurring);
    const numExpenses = randomBetween(20, 30);
    
    for (let i = 0; i < numExpenses; i++) {
      const template = pickRandom(variableExpenses);
      const amount = randomBetween(template.minAmount, template.maxAmount);
      
      // Check budget before adding
      if (monthExpense + amount > targetExpense) continue;
      
      const date = new Date(monthStart);
      date.setDate(randomBetween(1, Math.min(28, monthEnd.getDate())));
      addRandomTime(date);
      if (date > now) continue;
      
      transactions.push({
        type: "EXPENSE",
        amount,
        description: template.description,
        date,
        category: template.category,
        isRecurring: false,
        status: "COMPLETED",
        userId,
        accountId,
      });
      monthExpense += amount;
      totalExpense += amount;
    }

    // 4. Add occasional extra income (1-2 per month)
    if (Math.random() > 0.4) {
      const extraIncomeTemplates = incomeTransactions.filter(t => t.category !== "salary");
      const template = pickRandom(extraIncomeTemplates);
      const amount = template.amount || randomBetween(template.minAmount, template.maxAmount);
      const date = new Date(monthStart);
      date.setDate(randomBetween(10, 25));
      addRandomTime(date);
      if (date <= now) {
        transactions.push({
          type: "INCOME",
          amount,
          description: template.description,
          date,
          category: template.category,
          isRecurring: false,
          status: "COMPLETED",
          userId,
          accountId,
        });
        totalIncome += amount;
      }
    }

    console.log(`  Expenses: LKR ${monthExpense.toLocaleString()} (${((monthExpense/monthlyBudget)*100).toFixed(0)}% of budget)`);
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.date - b.date);

  // Calculate nextRecurringDate for recurring transactions
  const transactionsWithDates = transactions.map(t => {
    if (t.isRecurring && t.recurringInterval) {
      const nextDate = new Date(t.date);
      switch (t.recurringInterval) {
        case "DAILY":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "WEEKLY":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "YEARLY":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      return { ...t, nextRecurringDate: nextDate };
    }
    return t;
  });

  console.log(`\n========================================`);
  console.log(`Generating ${transactionsWithDates.length} transactions...`);
  console.log(`Total Income: LKR ${totalIncome.toLocaleString()}`);
  console.log(`Total Expenses: LKR ${totalExpense.toLocaleString()}`);
  console.log(`Net Change: LKR ${(totalIncome - totalExpense).toLocaleString()}`);

  // Insert transactions
  const created = await prisma.transaction.createMany({
    data: transactionsWithDates,
  });

  console.log(`\nCreated ${created.count} transactions!`);

  // Update account balance
  const currentBalance = parseFloat(account.balance);
  const newBalance = currentBalance + totalIncome - totalExpense;
  
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });

  console.log(`\nPrevious balance: LKR ${currentBalance.toLocaleString()}`);
  console.log(`New balance: LKR ${newBalance.toLocaleString()}`);
  console.log("\nSeed completed successfully!");
}

seedTransactions()
  .catch((e) => {
    console.error("Error seeding transactions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
