import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { UserName, Password } = body;

    if (!UserName || !Password) {
      return NextResponse.json(
        { error: "UserName and Password are required" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();

    const response = await axios.post(
      `${configs.apiBaseUrl}/users/signin?username=${encodeURIComponent(
        UserName
      )}&password=${encodeURIComponent(Password)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || Object.keys(response.data).length === 0) {
      return NextResponse.json(
        { error: "Login failed. Invalid username or password." },
        { status: 401 }
      );
    }
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/authentication",
      },
    });
    return NextResponse.json(
      { error: error?.response?.data?.error || "Failed to sign in" },
      { status: 500 }
    );
  }
}
