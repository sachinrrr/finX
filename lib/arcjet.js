import arcjet, { tokenBucket } from "@arcjet/next";

// Arcjet rate limiting configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track rate limits per user
  rules: [
    // Token bucket: 10 requests per hour with burst capacity of 10
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // Refill 10 tokens
      interval: 3600, // Every hour (3600 seconds)
      capacity: 10, // Maximum burst capacity
    }),
  ],
});

export default aj;