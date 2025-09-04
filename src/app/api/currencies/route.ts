import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import { NextResponse } from "next/server";
import configs from "../../../../configs";
import { getUserFromCookie } from "@/lib/auth/cookie";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getAccessToken();
    const res = await axios.get(`${configs.apiBaseUrl}/currency/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(res.data);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/currencies",
      },
    });
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
