import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

export async function POST() {
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

    // Find all recurring transactions for this user
    const recurringTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        isRecurring: true,
      },
    });

    const now = new Date();
    const updates = [];

    for (const transaction of recurringTransactions) {
      // Calculate the correct next recurring date based on the original transaction date
      let nextDate = new Date(transaction.date);
      
      // Keep adding intervals until we get a future date
      while (nextDate <= now) {
        switch (transaction.recurringInterval) {
          case "DAILY":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "YEARLY":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
      }

      // Update the transaction with the correct next recurring date
      await db.transaction.update({
        where: { id: transaction.id },
        data: { nextRecurringDate: nextDate },
      });

      updates.push({
        description: transaction.description,
        originalDate: transaction.date,
        oldNextDate: transaction.nextRecurringDate,
        newNextDate: nextDate,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} recurring transactions`,
      updates,
    });
  } catch (error) {
    console.error("Error fixing recurring dates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
