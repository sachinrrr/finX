"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/errors";
import { serializeData } from "@/lib/serialize";

// Fetch account with all transactions and transaction count
export async function getAccountWithTransactions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    // If account is not found, return null
    if (!account) return { success: true, data: null };

    // Return account data with transactions and count
    return { success: true, data: serializeData(account) };
  } catch (error) {
    // Handle any errors that occur during the process
    return { success: false, error: getErrorMessage(error) };
  }
}

// Delete multiple transactions and update account balances accordingly
export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Fetch transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Calculate balance changes per account (expenses add back, income subtracts)
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount.toNumber();
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Use database transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Delete all selected transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    // Revalidate dashboard and account pages
    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    // Handle any errors that occur during the process
    return { success: false, error: getErrorMessage(error) };
  }
}

// Set an account as the user's default account (only one can be default)
export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    // Revalidate dashboard page
    revalidatePath("/dashboard");
    return { success: true, data: serializeData(account) };
  } catch (error) {
    // Handle any errors that occur during the process
    return { success: false, error: getErrorMessage(error) };
  }
}

// Update account details (name, type, currency, default status)
export async function updateAccount(accountId, data) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const existingAccount = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    if (!existingAccount) return { success: false, error: "Account not found" };

    // Ensure at least one default account exists
    if (existingAccount.isDefault && data.isDefault === false) {
      return { success: false, error: "You need atleast 1 default account" };
    }

    // If setting as default, unset other default accounts first
    if (data.isDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency,
        isDefault: data.isDefault,
      },
    });

    // Revalidate dashboard and account pages
    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return { success: true, data: serializeData(account) };
  } catch (error) {
    // Handle any errors that occur during the process
    return { success: false, error: getErrorMessage(error) };
  }
}

// Delete an account (cannot delete default account or accounts with transactions)
export async function deleteAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    // Validate account exists and is not default
    if (!account) return { success: false, error: "Account not found" };
    if (account.isDefault) return { success: false, error: "Default account can't be deleted" };

    // Check if account has any transactions
    const transactionCount = await db.transaction.count({
      where: { userId: user.id, accountId },
    });

    if (transactionCount > 0) {
      return { success: false, error: "Please delete transactions for this account first" };
    }

    await db.account.delete({
      where: { id: accountId, userId: user.id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}