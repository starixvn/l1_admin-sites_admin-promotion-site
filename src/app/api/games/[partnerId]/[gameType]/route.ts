import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import config from "@/config";
import { getAccessToken } from "@/app/api/token/route";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ partnerId: string; gameType: string }> }
) {
  const { partnerId, gameType } = await context.params; // ✅ BẮT BUỘC phải await

  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${config.apiBaseUrl}/general_game_settings/games/${partnerId}/${gameType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
