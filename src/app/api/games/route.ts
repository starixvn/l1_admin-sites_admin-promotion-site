// src/app/api/games/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import { Game } from "@/types/game";
import { IGNORE_GAME_ID } from "@/constants/constants";
import * as Sentry from "@sentry/nextjs";
import { getUserFromCookie } from "@/lib/auth/cookie";

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 
  const searchParams = req.nextUrl.searchParams;
  const gameType = searchParams.get("type");
  const currencyGroups = searchParams.get("currencyGroups");
  const gameIds = searchParams.get("gameIds");

  try {
    const token = await getAccessToken();
    if (gameType && currencyGroups) {
      const response = await axios.get(
        `${configs.apiBaseUrl}/general_game_settings/games`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            gameType: gameType,
            currencyGroups: currencyGroups,
            gameIds: gameIds,
          },
        }
      );
      const filtered = response.data.filter(
        (g: Game) => g.GameId !== IGNORE_GAME_ID
      );
      return NextResponse.json(filtered);
    }

    const res = await axios.get(
      `${configs.apiBaseUrl}/general_game_settings/getAll`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const games = res.data;
    const filtered = gameType
      ? games.filter((g: Game) => g.Type === Number(gameType))
      : games;

    const result = filtered.filter((g: Game) => g.GameId !== IGNORE_GAME_ID);

    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        route: "/api/games",
      },
    });
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
