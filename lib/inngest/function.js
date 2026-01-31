import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { generateGeminiContent, getGeminiResponseText, stripCodeFences } from "@/lib/gemini";

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    // Process the recurring transaction
    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Use database transaction for atomicity
      await db.$transaction(async (tx) => {
        // Create new recurring transaction instance
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance based on transaction type
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update recurring transaction metadata
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = (process.env.GEMINI_MODEL || "").replace(/^models\//, "") || "gemini-1.5-flash";

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      throw new Error("GEMINI_API_KEY is not set");
    }
    
    let responseJson;
    try {
      responseJson = await generateGeminiContent({
        apiKey,
        apiVersion: "v1",
        model,
        parts: [{ text: prompt }],
      });
    } catch (e) {
      console.log("v1 failed, trying v1beta:", e.message);
      responseJson = await generateGeminiContent({
        apiKey,
        apiVersion: "v1beta",
        model,
        parts: [{ text: prompt }],
      });
    }

    const text = getGeminiResponseText(responseJson);
    console.log("Raw AI response:", text);
    
    const cleanedText = stripCodeFences(text);
    console.log("Cleaned text:", cleanedText);

    // Try to extract JSON array from the response
    let insights;
    try {
      insights = JSON.parse(cleanedText);
    } catch (parseError) {
      // If direct parsing fails, try to extract array from text
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        insights = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error("Could not extract JSON array from response");
      }
    }

    // Validate that we got an array with insights
    if (!Array.isArray(insights) || insights.length === 0) {
      throw new Error("Invalid insights format");
    }

    console.log("Generated insights:", insights);
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    console.error("Error details:", error.message);
    
    // Return personalized fallback based on actual data
    const fallbackInsights = [];
    
    if (stats.byCategory && Object.keys(stats.byCategory).length > 0) {
      const topCategory = Object.entries(stats.byCategory)
        .sort(([, a], [, b]) => b - a)[0];
      if (topCategory) {
        fallbackInsights.push(
          `Your highest expense category is ${topCategory[0]} at $${topCategory[1].toFixed(2)}.`
        );
      }
    }
    
    if (stats.totalIncome > 0 && stats.totalExpenses > 0) {
      const savingsRate = ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1);
      if (savingsRate > 0) {
        fallbackInsights.push(`You saved ${savingsRate}% of your income this month.`);
      } else {
        fallbackInsights.push(`You spent ${Math.abs(savingsRate)}% more than you earned this month.`);
      }
    }
    
    fallbackInsights.push("Consider reviewing your spending patterns for better financial management.");
    
    return fallbackInsights;
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: true, // Include ALL accounts, not just default
            },
          },
        },
      });
    });

    console.log(`Checking budget alerts for ${budgets.length} users`);

    for (const budget of budgets) {
      if (!budget.user.accounts || budget.user.accounts.length === 0) {
        console.log(`User ${budget.userId} has no accounts, skipping`);
        continue;
      }

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); // Start of current month
        startDate.setHours(0, 0, 0, 0);

        // Calculate total expenses across ALL user accounts
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = typeof budget.amount === 'object' && budget.amount.toNumber 
          ? budget.amount.toNumber() 
          : Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        console.log(`Budget check for user ${budget.userId}:`, {
          totalExpenses,
          budgetAmount,
          percentageUsed: percentageUsed.toFixed(1),
          lastAlertSent: budget.lastAlertSent,
        });

        // Check if we should send an alert
        const shouldSendAlert = 
          percentageUsed >= 80 && // Threshold of 80%
          (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()));

        if (shouldSendAlert) {
          console.log(`Sending budget alert to ${budget.user.email}`);
          
          try {
            const emailResult = await sendEmail({
              to: budget.user.email,
              subject: `Budget Alert - ${percentageUsed.toFixed(1)}% Used`,
              react: EmailTemplate({
                userName: budget.user.name,
                type: "budget-alert",
                data: {
                  percentageUsed: percentageUsed.toFixed(1),
                  budgetAmount: budgetAmount.toFixed(2),
                  totalExpenses: totalExpenses.toFixed(2),
                  accountName: "All Accounts",
                },
              }),
            });

            console.log("Email sent successfully:", emailResult);

            // Update last alert sent
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
            
            console.log(`Updated lastAlertSent for budget ${budget.id}`);
          } catch (error) {
            console.error("Error sending budget alert email:", error);
            throw error;
          }
        } else {
          console.log(`No alert needed: percentageUsed=${percentageUsed.toFixed(1)}%, lastAlertSent=${budget.lastAlertSent}`);
        }
      });
    }

    return { checked: budgets.length };
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDateExclusive = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDateExclusive,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}