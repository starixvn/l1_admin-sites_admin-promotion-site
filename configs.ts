const configs = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  env: process.env.NODE_ENV || "development",
  identityUrl: process.env.IDENTITY_URL!,
  clientId: process.env.IDENTITY_CLIENT_ID!,
  clientSecret: process.env.IDENTITY_CLIENT_SECRET!,
  scope: process.env.SCOPE!,
  apiPromotionUrl: process.env.NEXT_PUBLIC_API_PROMOTION_URL || "",
  apiConfigurationUrl: process.env.NEXT_PUBLIC_API_CONFIGURATION_URL || "",
};

export default configs;
