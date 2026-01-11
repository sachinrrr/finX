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

export function serializeData(value) {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (isDecimalLike(value)) {
    return value.toNumber();
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
