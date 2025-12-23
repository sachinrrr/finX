"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/accounts';

const AccountCard = ({account}) =>{
const {name, type, balance, id, isDefault} = account;

const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

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

  return (
<Card className="transition-colors group relative gradient-card gradient-shadow hover:bg-gray-50 border border-gray-200">
<Link href={`/account/${id}`}>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
    <Switch checked={isDefault} onClick={handleDefaultChange} disabled={updateDefaultLoading}/>
  </CardHeader>
  <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
            ${parseFloat(balance).toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
        </p>
  </CardContent>
  <CardFooter className="flex justify-between text-sm text-muted-foreground">
  <div className="flex items-center">
    <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-700" />
    Income
  </div>
  <div className="flex items-center">
    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
    Expense
  </div>
  </CardFooter>
  </Link>
</Card>

   
  );
};

export { AccountCard };