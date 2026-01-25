import { Inngest } from "inngest";

// Inngest client for background job processing (recurring transactions, budget alerts)
export const inngest = new Inngest({ 
  id: "finx", 
  name: "Finx",
  // Retry configuration with exponential backoff
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // 1s, 2s, 4s, 8s...
    maxAttempts: 2,
  }),
});
