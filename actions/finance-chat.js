"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  generateGeminiContent,
  getGeminiResponseText,
} from "@/lib/gemini";
import { getErrorMessage } from "@/lib/errors";

let cachedGeminiModels;
let cachedGeminiModelsAtMs;
let cachedGeminiModelsApiVersion;

async function listGeminiModels(apiKey) {
  const cacheTtlMs = 1000 * 60 * 10;
  if (
    cachedGeminiModels &&
    cachedGeminiModelsAtMs &&
    cachedGeminiModelsApiVersion &&
    Date.now() - cachedGeminiModelsAtMs < cacheTtlMs
  ) {
    return { apiVersion: cachedGeminiModelsApiVersion, models: cachedGeminiModels };
  }

  const versions = ["v1beta", "v1"];
  let lastError;

  for (const version of versions) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`,
        { method: "GET" }
      );

      if (!res.ok) {
        lastError = new Error(`ListModels failed (${version}): ${res.status} ${res.statusText}`);
        continue;
      }

      const json = await res.json();
      const models = Array.isArray(json?.models) ? json.models : [];
      cachedGeminiModels = models;
      cachedGeminiModelsAtMs = Date.now();
      cachedGeminiModelsApiVersion = version;
      return { apiVersion: version, models };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Unable to list Gemini models");
}

async function resolveGeminiModel(apiKey) {
  if (process.env.GEMINI_MODEL) {
    return {
      apiVersion: "v1beta",
      model: String(process.env.GEMINI_MODEL).replace(/^models\//, ""),
    };
  }

  const { apiVersion, models } = await listGeminiModels(apiKey);
  const supported = models
    .filter((m) => (m?.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => String(m?.name || ""))
    .filter(Boolean);

  const ids = supported.map((name) => name.replace(/^models\//, ""));

  const prefer = (id) => {
    const s = id.toLowerCase();
    if (s.includes("flash")) return 0;
    if (s.includes("pro")) return 1;
    return 2;
  };

  const sorted = [...ids].sort((a, b) => prefer(a) - prefer(b));
  if (sorted.length === 0) {
    throw new Error("No Gemini models available for generateContent for this API key");
  }

  return { apiVersion, model: sorted[0] };
}

export async function chatWithFinance(userMessage) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: "GEMINI_API_KEY is not set" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
        budgets: true,
      },
    });

    if (!user) return { success: false, error: "User not found" };

    // Get current date info for context
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Get start and end of last month
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Get all transactions for context (last 3 months for comprehensive data)
    const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
    
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: threeMonthsAgo,
        },
      },
      include: {
        account: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate summary statistics
    const currentMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth
    );
    const lastMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfLastMonth && new Date(t.date) <= endOfLastMonth
    );

    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group expenses by category for current and last month
    const categoryExpensesCurrentMonth = {};
    const categoryExpensesLastMonth = {};

    currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryExpensesCurrentMonth[t.category] =
          (categoryExpensesCurrentMonth[t.category] || 0) + Number(t.amount);
      });

    lastMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryExpensesLastMonth[t.category] =
          (categoryExpensesLastMonth[t.category] || 0) + Number(t.amount);
      });

    // Budget information
    const budget = user.budgets;
    const budgetAmount = budget ? Number(budget.amount) : null;
    const budgetStatus = budgetAmount
      ? {
          amount: budgetAmount,
          spent: currentMonthExpenses,
          remaining: budgetAmount - currentMonthExpenses,
          percentUsed: ((currentMonthExpenses / budgetAmount) * 100).toFixed(1),
          isOverBudget: currentMonthExpenses > budgetAmount,
        }
      : null;

    // Account balances
    const accountSummary = user.accounts.map((acc) => ({
      name: acc.name,
      type: acc.type,
      balance: Number(acc.balance),
      currency: acc.currency,
    }));

    const totalBalance = accountSummary.reduce((sum, acc) => sum + acc.balance, 0);

    // Recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10).map((t) => ({
      date: t.date.toISOString().split("T")[0],
      type: t.type,
      amount: Number(t.amount),
      category: t.category,
      description: t.description,
      account: t.account?.name,
    }));

    // Build context for Gemini
    const financialContext = `
## User Financial Data (as of ${now.toLocaleDateString()})

### Account Summary
- Total Balance: $${totalBalance.toFixed(2)}
- Accounts: ${JSON.stringify(accountSummary, null, 2)}

### Budget Status
${
  budgetStatus
    ? `- Monthly Budget: $${budgetStatus.amount.toFixed(2)}
- Spent This Month: $${budgetStatus.spent.toFixed(2)}
- Remaining: $${budgetStatus.remaining.toFixed(2)}
- Usage: ${budgetStatus.percentUsed}%
- Status: ${budgetStatus.isOverBudget ? "OVER BUDGET" : "Within Budget"}`
    : "No budget set"
}

### Current Month (${now.toLocaleString("default", { month: "long" })} ${currentYear})
- Total Expenses: $${currentMonthExpenses.toFixed(2)}
- Total Income: $${currentMonthIncome.toFixed(2)}
- Net: $${(currentMonthIncome - currentMonthExpenses).toFixed(2)}
- Expenses by Category: ${JSON.stringify(categoryExpensesCurrentMonth, null, 2)}

### Last Month
- Total Expenses: $${lastMonthExpenses.toFixed(2)}
- Total Income: $${lastMonthIncome.toFixed(2)}
- Expenses by Category: ${JSON.stringify(categoryExpensesLastMonth, null, 2)}

### Recent Transactions (Last 10)
${JSON.stringify(recentTransactions, null, 2)}

### All Transactions (Last 3 Months Summary)
- Total Transactions: ${transactions.length}
`;

    const systemPrompt = `You are a helpful financial assistant for the FinX personal finance app. You have access to the user's actual financial data provided below. Answer their questions accurately based on this data.

${financialContext}

Guidelines:
- Be concise and friendly
- Use the actual data provided to answer questions
- Format currency amounts properly (e.g., $1,234.56)
- If asked about spending in a specific category, look at the category breakdown
- If asked about budget status, use the budget information provided
- If the data doesn't contain information to answer a question, say so honestly
- Provide helpful insights when relevant
- Keep responses brief but informative
`;

    const resolved = await resolveGeminiModel(apiKey);

    const parts = [
      { text: systemPrompt },
      { text: `User question: ${userMessage}` },
    ];

    let responseJson;
    try {
      responseJson = await generateGeminiContent({
        apiKey,
        apiVersion: resolved.apiVersion,
        model: resolved.model,
        parts,
      });
    } catch (e) {
      // Try alternate API version
      const altVersion = resolved.apiVersion === "v1" ? "v1beta" : "v1";
      responseJson = await generateGeminiContent({
        apiKey,
        apiVersion: altVersion,
        model: resolved.model,
        parts,
      });
    }

    const responseText = getGeminiResponseText(responseJson);

    if (!responseText) {
      return { success: false, error: "No response from AI" };
    }

    return { success: true, data: responseText };
  } catch (error) {
    console.error("Error in chatWithFinance:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
