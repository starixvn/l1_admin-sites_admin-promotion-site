// src/app/api/games/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "../token/route";
import axios from "axios";
import config from "../../../config";

export async function GET(req: NextRequest) {
  try {
    const token = await getAccessToken();

    const res = await axios.get(
      `${config.apiBaseUrl}/general_game_settings/getAll`,
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
      ? games.filter((g: any) => g.Type === Number(type))
      : games;
    console.log("games", filtered);
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
