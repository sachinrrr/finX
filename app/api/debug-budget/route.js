"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get server time info
    const now = new Date();
    const serverInfo = {
      serverTime: now.toISOString(),
      serverTimeLocal: now.toString(),
      utcYear: now.getUTCFullYear(),
      utcMonth: now.getUTCMonth() + 1,
      utcDate: now.getUTCDate(),
      localYear: now.getFullYear(),
      localMonth: now.getMonth() + 1,
      localDate: now.getDate(),
    };

    // Calculate date ranges
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // Get budget
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    // Get default account
    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    // Get all recent transactions (last 10) to see actual stored dates
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...(defaultAccount ? { accountId: defaultAccount.id } : {}),
      },
      select: {
        id: true,
        amount: true,
        date: true,
        description: true,
        type: true,
      },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Calculate total
    const totalExpenses = transactions.reduce(
      (sum, t) => sum + (t.amount?.toNumber?.() || Number(t.amount) || 0),
      0
    );

    return NextResponse.json({
      serverInfo,
      dateRange: {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
      },
      budget: budget ? {
        id: budget.id,
        amount: budget.amount?.toNumber?.() || Number(budget.amount),
      } : null,
      defaultAccount: defaultAccount ? {
        id: defaultAccount.id,
        name: defaultAccount.name,
      } : null,
      transactionsThisMonth: transactions.map(t => ({
        id: t.id,
        amount: t.amount?.toNumber?.() || Number(t.amount),
        date: t.date?.toISOString?.() || t.date,
        description: t.description,
      })),
      totalExpenses,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
