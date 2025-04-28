// src/app/api/games/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import { Game } from "@/types/game";

export async function GET(req: NextRequest) {
  try {
    const token = await getAccessToken();

    const res = await axios.get(
      `${configs.apiBaseUrl}/general_game_settings/getAll`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const games = res.data;

    const filtered = type
      ? games.filter((g: Game) => g.Type === Number(type))
      : games;
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
