import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import configs from "../../../../../configs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await axios.delete(`${configs.apiPromotionUrl}/promotion-announcements/${id}`);

    return NextResponse.json({
      statusCode: 200,
      message: `Promotion announcement with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting promotion announcement:", error);
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          error: error.response?.data?.message || "Failed to delete promotion announcement",
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

