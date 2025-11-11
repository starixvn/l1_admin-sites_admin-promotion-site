import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth/cookie";
import axios, { AxiosError } from "axios";
import configs from "../../../../../../configs";
import * as Sentry from "@sentry/nextjs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { adminUserId } = body;

    if (!adminUserId) {
      return NextResponse.json(
        { error: "adminUserId is required" },
        { status: 400 }
      );
    }

    // Call the promotion API to cancel the promotion
    await axios.patch(
      `${configs.apiPromotionUrl}/promotions/${id}/cancel`,
      {
        adminUserId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      statusCode: 200,
      message: `Promotion with ID ${id} cancelled successfully`,
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/promotions/[id]/cancel",
      },
    });
    
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          error: error.response?.data?.message || "Failed to cancel promotion",
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to cancel promotion" },
      { status: 500 }
    );
  }
}
