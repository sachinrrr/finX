"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { getErrorMessage } from "@/lib/errors";

// Default IDs for seeding
const ACCOUNT_ID = "account-id";
const USER_ID = "user-id";

// Categories with typical amount ranges for realistic data generation
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  // Return a random number between min and max, rounded to 2 decimal places
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  // Get categories for the specified type
  const categories = CATEGORIES[type];
  // Select a random category
  const category = categories[Math.floor(Math.random() * categories.length)];
  // Generate a random amount within the category's range
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// Generate 90 days of realistic transaction data for testing
export async function seedTransactions() {
  try {
    // Initialize arrays to store transactions and running balance
    const transactions = [];
    let totalBalance = 0;

    // Generate transactions for the last 90 days
    for (let i = 90; i >= 0; i--) {
      // Calculate the date for this iteration
      const date = subDays(new Date(), i);

      // Generate 1-3 random transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% income, 60% expense for realistic distribution
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        // Get a random category and amount for this transaction
        const { category, amount } = getRandomCategory(type);

        // Create a new transaction object
        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        // Update running balance
        totalBalance += type === "INCOME" ? amount : -amount;
        // Add transaction to the array
        transactions.push(transaction);
      }
    }

    // Use database transaction for atomicity
    await db.$transaction(async (tx) => {
      // Clear existing transactions for this account
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert all generated transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account with final calculated balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    // Return success message with number of transactions created
    return {
      success: true,
      data: {
        message: `Created ${transactions.length} transactions`,
      },
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}