import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/accounts";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { formatMoney } from "@/lib/money";

export default async function AccountPage({ params }) {
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5 py-8">
      <div className="gradient-card rounded-xl p-6 gradient-shadow">
        <div className="flex gap-4 items-end justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-title capitalize">
              {account.name}
            </h1>
            <p className="text-muted-foreground">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
              Account
            </p>
          </div>

          <div className="text-right pb-2">
            <div className="text-lg sm:text-xl font-bold gradient-title">
              {formatMoney(account.balance, account.currency)}
            </div>
            <p className="text-sm text-muted-foreground">
              {account._count.transactions} Transactions
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#ec4899" />}
      >
        <AccountChart transactions={transactions} currency={account.currency} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#ec4899" />}
      >
        <TransactionTable transactions={transactions} currency={account.currency} />
      </Suspense>
    </div>
  );
}