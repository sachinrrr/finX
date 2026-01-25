"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  generateGeminiContent,
  getGeminiResponseText,
} from "@/lib/gemini";
import { getErrorMessage } from "@/lib/errors";

// Cache for Gemini models (10 minute TTL)
let cachedGeminiModels;
let cachedGeminiModelsAtMs;
let cachedGeminiModelsApiVersion;

// Fetch available Gemini models from Google's API with caching
async function listGeminiModels(apiKey) {
  const cacheTtlMs = 1000 * 60 * 10; // 10 minutes
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

// Resolve the best available Gemini model (prioritizes Flash > Pro > Others)
async function resolveGeminiModel(apiKey) {
  // Allow manual override via environment variable
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

// Build comprehensive financial context for AI assistant
async function getFinancialContext(userId) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      budgets: true,
    },
  });

  if (!user) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate date ranges for current month, last month, and 3 months ago
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
  const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);

  // Fetch last 3 months of transactions
  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: threeMonthsAgo },
    },
    include: {
      account: { select: { name: true, type: true } },
    },
    orderBy: { date: "desc" },
  });

  // Filter transactions by month
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth
  );
  const lastMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfLastMonth && new Date(t.date) <= endOfLastMonth
  );

  // Calculate income and expenses for current month
  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate income and expenses for last month
  const lastMonthExpenses = lastMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Group expenses by category for both months
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

  // Calculate budget status if budget exists
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

  const accountSummary = user.accounts.map((acc) => ({
    name: acc.name,
    type: acc.type,
    balance: Number(acc.balance),
    currency: acc.currency,
  }));

  const totalBalance = accountSummary.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Get primary currency from first account (default to USD)
  const primaryCurrency = user.accounts[0]?.currency || "USD";

  // Format recent transactions for AI context
  const recentTransactions = transactions.slice(0, 10).map((t) => ({
    date: t.date.toISOString().split("T")[0],
    type: t.type,
    amount: Number(t.amount),
    category: t.category,
    description: t.description,
    account: t.account?.name,
  }));

  // Return formatted financial context for AI
  return {
    currency: primaryCurrency,
    context: `
## User Financial Data (as of ${now.toLocaleDateString()})

### User's Currency: ${primaryCurrency}
IMPORTANT: Always format all monetary amounts using ${primaryCurrency} currency. Do not use $ symbol unless the currency is USD.

### Account Summary
- Total Balance: ${totalBalance.toLocaleString()} ${primaryCurrency}
- Accounts: ${JSON.stringify(accountSummary, null, 2)}

### Budget Status
${
  budgetStatus
    ? `- Monthly Budget: ${budgetStatus.amount.toLocaleString()} ${primaryCurrency}
- Spent This Month: ${budgetStatus.spent.toLocaleString()} ${primaryCurrency}
- Remaining: ${budgetStatus.remaining.toLocaleString()} ${primaryCurrency}
- Usage: ${budgetStatus.percentUsed}%
- Status: ${budgetStatus.isOverBudget ? "OVER BUDGET" : "Within Budget"}`
    : "No budget set"
}

### Current Month (${now.toLocaleString("default", { month: "long" })} ${currentYear})
- Total Expenses: ${currentMonthExpenses.toLocaleString()} ${primaryCurrency}
- Total Income: ${currentMonthIncome.toLocaleString()} ${primaryCurrency}
- Net: ${(currentMonthIncome - currentMonthExpenses).toLocaleString()} ${primaryCurrency}
- Expenses by Category: ${JSON.stringify(categoryExpensesCurrentMonth, null, 2)}

### Last Month
- Total Expenses: ${lastMonthExpenses.toLocaleString()} ${primaryCurrency}
- Total Income: ${lastMonthIncome.toLocaleString()} ${primaryCurrency}
- Expenses by Category: ${JSON.stringify(categoryExpensesLastMonth, null, 2)}

### Recent Transactions (Last 10)
${JSON.stringify(recentTransactions, null, 2)}

### All Transactions (Last 3 Months Summary)
- Total Transactions: ${transactions.length}
`
  };
}

// Retrieve all conversations for authenticated user (sorted by most recent)
export async function getConversations() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const conversations = await db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Retrieve a specific conversation with all its messages
export async function getConversation(conversationId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) return { success: false, error: "Conversation not found" };

    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Create a new chat conversation
export async function createConversation() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const conversation = await db.conversation.create({
      data: {
        userId: user.id,
        title: "New Chat",
      },
    });

    revalidatePath("/chat");
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Delete a conversation and all its messages
export async function deleteConversation(conversationId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    await db.conversation.deleteMany({
      where: {
        id: conversationId,
        userId: user.id,
      },
    });

    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Send a message and generate AI response with full financial context
export async function sendMessage(conversationId, userMessage) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: "GEMINI_API_KEY is not set" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) return { success: false, error: "Conversation not found" };

    // Save user message to database
    await db.message.create({
      data: {
        conversationId,
        role: "USER",
        content: userMessage,
      },
    });

    // Get user's financial context for AI
    const financialData = await getFinancialContext(user.id);
    const userCurrency = financialData?.currency || "USD";
    const financialContext = financialData?.context || "No financial data available.";

    // Build conversation history (last 10 messages)
    const conversationHistory = conversation.messages
      .slice(-10)
      .map((m) => `${m.role === "USER" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `You are a helpful financial assistant for the FinX personal finance app. You have access to the user's actual financial data provided below. Answer their questions accurately based on this data.

${financialContext}

Previous conversation:
${conversationHistory}

Guidelines:
- Be concise and friendly
- Use the actual data provided to answer questions
- IMPORTANT: The user's currency is ${userCurrency}. Always format all monetary amounts with the currency code ${userCurrency} (e.g., 1,234.56 ${userCurrency}). Never use $ unless the currency is USD.
- DO NOT use markdown formatting like **bold** or *italic* in your responses. Write plain text only.
- DO NOT use asterisks (*) for emphasis. Use regular text.
- If asked about spending in a specific category, look at the category breakdown
- If asked about budget status, use the budget information provided
- If the data doesn't contain information to answer a question, say so honestly
- Provide helpful insights when relevant
- Keep responses brief but informative
`;

    // Resolve best available Gemini model
    const resolved = await resolveGeminiModel(apiKey);

    const parts = [
      { text: systemPrompt },
      { text: `User: ${userMessage}` },
    ];

    // Generate AI response with fallback to alternate API version
    let responseJson;
    try {
      responseJson = await generateGeminiContent({
        apiKey,
        apiVersion: resolved.apiVersion,
        model: resolved.model,
        parts,
      });
    } catch (e) {
      // Fallback to alternate API version if first attempt fails
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

    // Save assistant message
    const assistantMessage = await db.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: responseText,
      },
    });

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0) {
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
      await db.conversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/chat");
    return { success: true, data: { role: "ASSISTANT", content: responseText, id: assistantMessage.id } };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
