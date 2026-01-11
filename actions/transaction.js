"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Buffer } from "buffer";
import {
  extractJsonObject,
  generateGeminiContent,
  getGeminiResponseText,
} from "@/lib/gemini";
import { getErrorMessage } from "@/lib/errors";
import { serializeData } from "@/lib/serialize";

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

  const versions = ["v1", "v1beta"];
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

async function resolveGeminiModel(apiKey, { preferVision } = {}) {
  if (process.env.GEMINI_MODEL) {
    return {
      apiVersion: "v1",
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
    if (preferVision && (s.includes("vision") || s.includes("pro-vision"))) return 0;
    if (s.includes("flash")) return 1;
    if (s.includes("pro")) return 2;
    return 3;
  };

  const sorted = [...ids].sort((a, b) => prefer(a) - prefer(b));
  if (sorted.length === 0) {
    throw new Error("No Gemini models available for generateContent for this API key");
  }

  return { apiVersion, model: sorted[0] };
}

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) return { success: false, error: "Account not found" };

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeData(transaction) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const transaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) return { success: false, error: "Transaction not found" };

    return { success: true, data: serializeData(transaction) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) return { success: false, error: "Transaction not found" };

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeData(transaction) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: serializeData(transactions) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: "GEMINI_API_KEY is not set" };

    if (!file || typeof file.arrayBuffer !== "function") {
      return { success: false, error: "Invalid receipt file" };
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    let resolved;
    try {
      resolved = await resolveGeminiModel(apiKey, { preferVision: true });
    } catch (e) {
      const listed = await listGeminiModels(apiKey).catch(() => null);
      const availableIds = (listed?.models || [])
        .filter((m) => (m?.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => String(m?.name || "").replace(/^models\//, ""))
        .filter(Boolean)
        .slice(0, 12);

      if (availableIds.length > 0) {
        return {
          success: false,
          error: `Set GEMINI_MODEL to one of: ${availableIds.join(", ")}`,
        };
      }

      return { success: false, error: getErrorMessage(e) };
    }

    const parts = [
      {
        inlineData: {
          data: base64String,
          mimeType: file.type || "image/jpeg",
        },
      },
      { text: prompt },
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
      if (resolved.apiVersion === "v1") {
        responseJson = await generateGeminiContent({
          apiKey,
          apiVersion: "v1beta",
          model: resolved.model,
          parts,
        });
      } else {
        responseJson = await generateGeminiContent({
          apiKey,
          apiVersion: "v1",
          model: resolved.model,
          parts,
        });
      }
    }

    const text = getGeminiResponseText(responseJson);
    const cleanedText = extractJsonObject(text);

    try {
      const data = JSON.parse(cleanedText);

      if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount),
          date: data.date,
          description: data.description,
          category: data.category,
          merchantName: data.merchantName,
        },
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return { success: false, error: "Invalid response format from Gemini" };
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return { success: false, error: getErrorMessage(error, "Failed to scan receipt") };
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}