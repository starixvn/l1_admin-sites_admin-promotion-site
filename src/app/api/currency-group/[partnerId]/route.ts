import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../../configs";
import * as Sentry from "@sentry/nextjs";
import { getUserFromCookie } from "@/lib/auth/cookie";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ partnerId: string; }> }
) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { partnerId } = await context.params;

  try {
    const token = await getAccessToken();

    const res = await axios.get(
      `${configs.apiBaseUrl}/currency_group/partner/${partnerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        partnerId,
        route: "/api/currency-group/[partnerId]",
      },
    });
    return NextResponse.json(
      { error: "Failed to fetch currency groups" },
      { status: 500 }
    );
  }
}
