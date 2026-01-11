import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview.jsx";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const [accountsResult, transactionsResult] = await Promise.all([
      getUserAccounts(),
      getDashboardData(),
    ]);

    if (!accountsResult?.success) {
      throw new Error(accountsResult?.error || "Failed to load accounts");
    }

    if (!transactionsResult?.success) {
      throw new Error(transactionsResult?.error || "Failed to load transactions");
    }

    const accounts = accountsResult.data;
    const transactions = transactionsResult.data;

    const defaultAccount = accounts?.find((account) => account.isDefault);

    // Get budget for default account
    let budgetData = null;
    if (defaultAccount) {
      const budgetResult = await getCurrentBudget(defaultAccount.id);
      budgetData = budgetResult?.success ? budgetResult.data : null;
    }

    return (
      <div className="space-y-8">
        {/* Budget Progress */}
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
          currency={defaultAccount?.currency || "USD"}
        />

        {/* Dashboard Overview */}
        <Suspense fallback={"Loading Overview..."}>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </Suspense>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed gradient-card gradient-shadow">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts?.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);

    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      </div>
    );
  }
}