const isPlainObject = (value) => {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const isDecimalLike = (value) =>
  value &&
  typeof value === "object" &&
  typeof value.toNumber === "function" &&
  (value.constructor?.name === "Decimal" || value.constructor?.name === "PrismaDecimal");

const isDecimal = (value) => {
  return value && typeof value === "object" && value.constructor && 
    (value.constructor.name === "Decimal" || 
     value.constructor.name === "PrismaDecimal" ||
     (typeof value.d !== "undefined" && typeof value.e !== "undefined" && typeof value.s !== "undefined"));
};

export function serializeData(value) {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (isDecimalLike(value) || isDecimal(value)) {
    return typeof value.toNumber === "function" ? value.toNumber() : parseFloat(value.toString());
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeData);
  }

  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeData(v);
    }
    return out;
  }

  return value;
}
