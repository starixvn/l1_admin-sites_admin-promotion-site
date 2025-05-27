import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../configs";
import * as Sentry from "@sentry/nextjs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  try {
    const res = await axios.get(`${configs.apiPromotionUrl}/promotions/check-code`, {
      params: { code },
    });

    return NextResponse.json(res.data);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/promotions/check-code",
      },
    });
    return NextResponse.json(
      { error: "Failed to check promotion code" },
      { status: 500 }
    );
  }
}
