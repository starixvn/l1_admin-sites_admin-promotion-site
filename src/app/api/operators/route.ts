import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import * as Sentry from "@sentry/nextjs";
export async function GET() {
  try {
    const token = await getAccessToken();
  
    const res = await axios.get(`${configs.apiBaseUrl}/partner`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/operators",
      },
    });
    return NextResponse.json(
      { error: "Failed to fetch operators" },
      { status: 500 }
    );
  }
}
