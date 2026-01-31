"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/errors";
import { unstable_noStore as noStore } from "next/cache";

// Fetch current budget and month's expenses for an account
export async function getCurrentBudget(accountId) {
  noStore(); // Disable caching for this function
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Fetch user data from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Fetch user's budget
    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Calculate current month date range
    // Adjust for IST timezone (UTC+5:30) since transactions are stored in IST
    const now = new Date();
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);
    
    const year = istNow.getUTCFullYear();
    const month = istNow.getUTCMonth();
    
    // Start of current month in IST (converted to UTC for database query)
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - IST_OFFSET_MS);
    // End of current month in IST (converted to UTC for database query)
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999) - IST_OFFSET_MS);

    console.log("Budget calculation:", {
      serverTimeUTC: now.toISOString(),
      istTime: istNow.toISOString(),
      year,
      month: month + 1,
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
      accountId,
    });

    // Aggregate current month's expenses
    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    const currentExpenses = expenses._sum.amount
      ? expenses._sum.amount.toNumber()
      : 0;

    console.log("Budget result:", {
      budgetAmount: budget?.amount?.toNumber(),
      currentExpenses,
    });

    // Return budget and expenses data
    return {
      success: true,
      data: {
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        currentExpenses,
      },
    };
  } catch (error) {
    // Log and return error
    console.error("Error fetching budget:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Update or create user's monthly budget
export async function updateBudget(amount) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Fetch user data from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Upsert budget (update if exists, create if not)
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}