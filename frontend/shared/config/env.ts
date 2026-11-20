export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
} as const;