// Extract error message from various error types
export function getErrorMessage(error, fallback = "") {
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error || fallback;
  }

  // Handle object errors (e.g., API responses)
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message || fallback;
    }

    // Try to stringify the error object
    try {
      const json = JSON.stringify(error);
      return json === "{}" ? fallback : json;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
