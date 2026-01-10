"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import useFetch from "@/hooks/use-fetch";
import { deleteAccount, updateAccount, updateDefaultAccount } from "@/actions/accounts";
import { formatMoney } from "@/lib/money";
import { accountSchema } from "@/app/lib/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CurrencyPicker } from "@/components/currency-picker";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault, currency, _count } = account;
  const transactionCount = _count?.transactions ?? 0;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const editAccountSchema = useMemo(() => accountSchema.omit({ balance: true }), []);

  const defaultValues = useMemo(
    () => ({
      name: name ?? "",
      type: type ?? "CURRENT",
      currency: currency ?? "USD",
      isDefault: Boolean(isDefault),
    }),
    [name, type, currency, isDefault]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(editAccountSchema),
    defaultValues,
  });

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const {
    loading: updateAccountLoading,
    fn: updateAccountFn,
    data: updatedAccountDetails,
    error: updateAccountError,
  } = useFetch(updateAccount);

  const {
    loading: deleteAccountLoading,
    fn: deleteAccountFn,
    data: deletedAccount,
    error: deleteAccountError,
  } = useFetch(deleteAccount);

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  useEffect(() => {
    if (updatedAccountDetails?.success) {
      toast.success("Account updated successfully");
      setEditOpen(false);
    }
  }, [updatedAccountDetails]);

  useEffect(() => {
    if (updateAccountError) {
      toast.error(updateAccountError.message || "Failed to update account");
    }
  }, [updateAccountError]);

  useEffect(() => {
    if (deletedAccount?.success) {
      toast.success("Account deleted successfully");
      setDeleteOpen(false);
    }
  }, [deletedAccount]);

  useEffect(() => {
    if (deleteAccountError) {
      toast.error(deleteAccountError.message || "Failed to delete account");
    }
  }, [deleteAccountError]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitEdit = async (data) => {
    await updateAccountFn(id, data);
  };

  const handleConfirmDelete = async () => {
    await deleteAccountFn(id);
  };

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  return (
    <>
      <Card className="transition-colors group relative gradient-card gradient-shadow hover:bg-muted border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Link
            href={`/account/${id}`}
            aria-label={`View ${name} account`}
            className="min-w-0 flex-1"
          >
            <CardTitle className="text-sm font-medium capitalize truncate">{name}</CardTitle>
          </Link>
          <div className="flex items-center gap-2">
            <Switch checked={isDefault} onClick={handleDefaultChange} disabled={updateDefaultLoading} />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isDefault || transactionCount > 0}
                  onSelect={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <Link href={`/account/${id}`} className="block" aria-label={`Open ${name} account details`}>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatMoney(balance, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-primary" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-destructive" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Account</DrawerTitle>
            <DrawerDescription>Update your account details.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor={`name-${id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Account Name
                </label>
                <Input id={`name-${id}`} placeholder="e.g., Main Checking" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`type-${id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Account Type
                </label>
                <Select
                  onValueChange={(value) => setValue("type", value, { shouldDirty: true })}
                  value={watch("type")}
                >
                  <SelectTrigger id={`type-${id}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`currency-${id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Currency
                </label>
                <CurrencyPicker
                  value={watch("currency")}
                  onChange={(value) => setValue("currency", value, { shouldDirty: true })}
                />
                {errors.currency && (
                  <p className="text-sm text-red-500">{errors.currency.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <label htmlFor={`isDefault-${id}`} className="text-base font-medium cursor-pointer">
                    Set as Default
                  </label>
                  <p className="text-sm text-muted-foreground">
                    This account will be selected by default for transactions
                  </p>
                </div>
                <Switch
                  id={`isDefault-${id}`}
                  checked={watch("isDefault")}
                  onClick={(e) => e.preventDefault()}
                  onCheckedChange={(checked) =>
                    setValue("isDefault", checked, { shouldDirty: true })
                  }
                />
              </div>

              <DrawerFooter className="px-0">
                <div className="flex gap-4">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="flex-1" disabled={updateAccountLoading}>
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button type="submit" className="flex-1" disabled={updateAccountLoading}>
                    {updateAccountLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-destructive">Delete account</DrawerTitle>
            <DrawerDescription>
              This action can’t be undone.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium truncate">{name}</div>
              <div className="text-sm text-muted-foreground">
                {transactionCount > 0
                  ? `This account has ${transactionCount} transaction(s). Delete them first.`
                  : isDefault
                  ? "Default account can't be deleted. Set another account as default first."
                  : "No transactions found for this account."}
              </div>
            </div>
            <div className="flex gap-4 pt-1">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1" disabled={deleteAccountLoading}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={deleteAccountLoading || isDefault || transactionCount > 0}
                onClick={handleConfirmDelete}
              >
                {deleteAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>

   
  );
};

export { AccountCard };