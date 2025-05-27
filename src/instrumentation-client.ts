import * as Sentry from "@sentry/nextjs";
import configs from "../configs.json";

Sentry.init({ ...configs.sentry });
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
