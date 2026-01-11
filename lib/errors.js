export function getErrorMessage(error, fallback = "") {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error || fallback;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message || fallback;
    }

    try {
      const json = JSON.stringify(error);
      return json === "{}" ? fallback : json;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
