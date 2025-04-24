const config = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    env: process.env.NODE_ENV || "development",
    featureFlagX: process.env.NEXT_PUBLIC_FEATURE_X === "true",
    identityUrl: process.env.IDENTITY_URL!,
    clientId: process.env.IDENTITY_CLIENT_ID!,
    clientSecret: process.env.IDENTITY_CLIENT_SECRET!,
    scope: process.env.SCOPE!,
  };
  
  if (!config.apiBaseUrl) {
    throw new Error("❌ NEXT_PUBLIC_API_BASE_URL is not defined in your .env file");
  }
  
  export default config;
  