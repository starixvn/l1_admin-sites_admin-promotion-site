import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import configs from "../../../../../configs";
import * as Sentry from "@sentry/nextjs";
import { getUserFromCookie } from "@/lib/auth/cookie";
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await axios.delete(
      `${configs.apiPromotionUrl}/promotion-announcements/${id}`
    );

    return NextResponse.json({
      statusCode: 200,
      message: `Promotion announcement with ID ${id} deleted successfully`,
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/announcement/[id]",
      },
    });
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          error:
            error.response?.data?.message ||
            "Failed to delete promotion announcement",
        },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete promotion announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const data = await request.json();
    const response = await axios.put(
      `${configs.apiPromotionUrl}/promotion-announcements/${id}`,
      data
    );
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/announcement/[id]",
      },
    });
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          error: error.response?.data?.message || "Failed to update promotion",
        },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update promotion" },
      { status: 500 }
    );
  }
}
