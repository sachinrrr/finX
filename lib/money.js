// Get list of all supported currency codes
export function getSupportedCurrencies() {
  try {
    // Use Intl API if available (modern browsers)
    if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("currency");
    }
  } catch {
    // Silently fall through to fallback
  }

  // Fallback list of common currencies
  return ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CNY"];
}

// Get human-readable currency name (e.g., "USD" -> "US Dollar")
export function getCurrencyName(currency, locale = "en") {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
      const dn = new Intl.DisplayNames(locale, { type: "currency" });
      return dn.of(currency) || currency;
    }
  } catch {
    // Silently fall through to fallback
  }

  return currency;
}

// Get currency symbol (e.g., "USD" -> "$")
export function getCurrencySymbol(currency, locale = "en") {
  try {
    // Format a number and extract the currency symbol
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).formatToParts(0);

    const symbol = parts.find((p) => p.type === "currency")?.value;
    return symbol || currency;
  } catch {
    return currency;
  }
}

// Format amount as currency string (e.g., 1234.56 -> "$1,234.56")
export function formatMoney(amount, currency = "USD", locale = "en") {
  // Convert string to number if needed
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(safeAmount);
  } catch {
    // Fallback if currency code is invalid
    return `${currency} ${safeAmount.toFixed(2)}`;
  }
}
