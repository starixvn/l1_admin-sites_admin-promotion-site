import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";
/**
 * @type {import('next').NextConfig}
 */
import configs from "./configs.json";
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: configs.apiBaseUrl,
    NEXT_PUBLIC_API_PROMOTION_URL: configs.apiPromotionUrl,
    NEXT_PUBLIC_API_CONFIGURATION_URL: configs.apiConfigurationUrl,
    IDENTITY_URL: configs.identityUrl,
    IDENTITY_CLIENT_ID: configs.clientId,
    IDENTITY_CLIENT_SECRET: configs.clientSecret,
    SCOPE: configs.scope,
    IDENTITY_SITE_ID: configs.siteId,
    SENTRY_DSN: configs.sentry.dsn,
  },
};

export default withSentryConfig(nextConfig, {
  sentryUrl: configs.sentry.dsn,
  release: {
    deploy: {
      env: configs.sentry.environment,
    },
  },
  widenClientFileUpload: true,
  automaticVercelMonitors: false,
});