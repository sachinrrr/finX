"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/errors";

// Fetch current budget and month's expenses for an account
export async function getCurrentBudget(accountId) {
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
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

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

    // Return budget and expenses data
    return {
      success: true,
      data: {
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        currentExpenses: expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0,
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