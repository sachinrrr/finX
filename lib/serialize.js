// Check if value is a plain object (not a class instance)
const isPlainObject = (value) => {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

// Check if value is a Decimal-like object (has toNumber method)
const isDecimalLike = (value) =>
  value &&
  typeof value === "object" &&
  typeof value.toNumber === "function" &&
  (value.constructor?.name === "Decimal" || value.constructor?.name === "PrismaDecimal");

// Check if value is a Prisma Decimal object
const isDecimal = (value) => {
  return value && typeof value === "object" && value.constructor && 
    (value.constructor.name === "Decimal" || 
     value.constructor.name === "PrismaDecimal" ||
     (typeof value.d !== "undefined" && typeof value.e !== "undefined" && typeof value.s !== "undefined"));
};

// Serialize Prisma data for JSON responses (handles Decimals, Dates, BigInts)
export function serializeData(value) {
  if (value == null) return value;

  // Convert BigInt to string
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Convert Prisma Decimal to number
  if (isDecimalLike(value) || isDecimal(value)) {
    return typeof value.toNumber === "function" ? value.toNumber() : parseFloat(value.toString());
  }

  // Convert Date to ISO string
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Recursively serialize arrays
  if (Array.isArray(value)) {
    return value.map(serializeData);
  }

  // Recursively serialize plain objects
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeData(v);
    }
    return out;
  }

  return value;
}
