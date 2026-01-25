"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/errors";
import { serializeData } from "@/lib/serialize";

// Fetch all accounts for authenticated user
export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch accounts with transaction count
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return { success: true, data: serializeData(accounts) };
  } catch (error) {
    console.error("Error in getUserAccounts:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

// Create a new account for authenticated user
export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate and convert balance to float
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      return { success: false, error: "Invalid balance amount" };
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // First account is always default, otherwise use user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // Unset other default accounts if this one should be default
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeData(account) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Fetch all dashboard data (transactions) for authenticated user
export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch all user transactions sorted by date
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return { success: true, data: serializeData(transactions) };
  } catch (error) {
    console.error("Error in getDashboardData:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}