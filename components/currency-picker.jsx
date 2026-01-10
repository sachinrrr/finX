"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getCurrencyName,
  getCurrencySymbol,
  getSupportedCurrencies,
} from "@/lib/money";

export function CurrencyPicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currencies = useMemo(() => getSupportedCurrencies(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;

    return currencies.filter((code) => {
      const name = getCurrencyName(code).toLowerCase();
      const symbol = getCurrencySymbol(code).toLowerCase();
      return (
        code.toLowerCase().includes(q) ||
        name.includes(q) ||
        symbol.includes(q)
      );
    });
  }, [currencies, query]);

  const selectedLabel = useMemo(() => {
    const code = value || "USD";
    const symbol = getCurrencySymbol(code);
    const name = getCurrencyName(code);
    return `${symbol} ${code} · ${name}`;
  }, [value]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        className={cn(
          "z-[60] w-[320px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none"
        )}
        align="start"
        sideOffset={4}
      >
        <Input
          placeholder="Search currency by code, name, or symbol..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />

        <div className="max-h-[260px] overflow-auto rounded-md border">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No currencies found</div>
          ) : (
            filtered.map((code) => {
              const symbol = getCurrencySymbol(code);
              const name = getCurrencyName(code);
              const isSelected = code === (value || "USD");

              return (
                <button
                  key={code}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => {
                    onChange?.(code);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center tabular-nums">{symbol}</span>
                      <span className="font-medium">{code}</span>
                      <span className="text-muted-foreground truncate">{name}</span>
                    </div>
                  </div>
                  <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                </button>
              );
            })
          )}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
