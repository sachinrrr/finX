import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  const accountsResult = await getUserAccounts();
  if (!accountsResult?.success) {
    throw new Error(accountsResult?.error || "Failed to load accounts");
  }

  const accounts = accountsResult.data;
  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transactionResult = await getTransaction(editId);
    if (!transactionResult?.success) {
      throw new Error(transactionResult?.error || "Failed to load transaction");
    }
    initialData = transactionResult.data;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">{editId?"Edit ":"Add "}Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}