export function getSupportedCurrencies() {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("currency");
    }
  } catch {
    // ignore
  }

  // Minimal fallback (should rarely be hit in modern browsers)
  return ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CNY"];
}

export function getCurrencyName(currency, locale = "en") {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
      const dn = new Intl.DisplayNames(locale, { type: "currency" });
      return dn.of(currency) || currency;
    }
  } catch {
    // ignore
  }

  return currency;
}

export function getCurrencySymbol(currency, locale = "en") {
  try {
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

export function formatMoney(amount, currency = "USD", locale = "en") {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(safeAmount);
  } catch {
    // Fallback if currency code is invalid or unsupported
    return `${currency} ${safeAmount.toFixed(2)}`;
  }
}
