"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { categoryColors } from "@/data/categories";

export function DashboardOverview({ accounts, transactions }) {
  // Ensure consistent initial state to prevent hydration mismatch
  const defaultAccountId = accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || null;
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId);
  
  // Month filter for expense breakdown - default to current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth(); // 0-indexed
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);

  // All 12 months for the current year
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get recent transactions (last 5)
  const accountTransactions = transactions?.filter(
    (t) => t.accountId === selectedAccountId
  ) || [];

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate expense breakdown for selected month (current year only)
  const selectedMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === selectedMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  // Group expenses by category
  const expensesByCategory = selectedMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const selectedAccountCurrency =
    accounts?.find((a) => a.id === selectedAccountId)?.currency || "USD";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              )) || []}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center",
                        transaction.type === "EXPENSE"
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      {formatMoney(transaction.amount, selectedAccountCurrency)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">
            Monthly Expense Breakdown
          </CardTitle>
          <Select
            value={String(selectedMonth)}
            onValueChange={(val) => setSelectedMonth(Number(val))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {allMonths.map((monthName, index) => (
                <SelectItem key={index} value={String(index)}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="rounded-full bg-muted/50 p-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
              <p className="text-center text-sm text-muted-foreground font-medium">
                No expenses this month
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chart with labels */}
              <div className="h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={{
                        stroke: 'hsl(var(--muted-foreground))',
                        strokeWidth: 1,
                      }}
                      label={({ 
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                        name
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={categoryColors[name] || '#94a3b8'}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-[11px] font-medium"
                          >
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={categoryColors[entry.name] || '#94a3b8'}
                          className="transition-opacity hover:opacity-80 cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        formatMoney(value, selectedAccountCurrency),
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      itemStyle={{
                        padding: '2px 0',
                        textTransform: 'capitalize',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '0.875rem',
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '0.875rem',
                      }}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}