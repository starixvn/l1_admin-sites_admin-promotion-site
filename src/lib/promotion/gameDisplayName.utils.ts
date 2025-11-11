import axios from 'axios';
import configs from '../../../configs';
import { getAccessToken } from '@/lib/auth/getAccessToken';

export interface GameInfo {
  GameId: number;
  Name: string;
  DisplayName: string;
  Type: number;
  IsEnabledJackpot: boolean;
}

/**
 * Fetches games data and creates a map of GameId to DisplayName
 * @param gameType - The game type to filter by
 * @param currencyGroups - Currency groups to filter by
 * @returns Map of GameId to DisplayName
 */
export async function createGameDisplayNameMap(
  gameType?: string | null,
  currencyGroups?: string | null
): Promise<Map<number, string>> {
  try {
    const token = await getAccessToken();
    
    const games = await axios.get(`${configs.apiBaseUrl}/general_game_settings/games`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        gameType: gameType,
        currencyGroups: currencyGroups,
      },
    });

    const gameDisplayNameMap = new Map<number, string>();
    games.data?.forEach((game: GameInfo) => {
      gameDisplayNameMap.set(game.GameId, game.DisplayName);
    });

    return gameDisplayNameMap;
  } catch (error) {
    console.error('Error fetching games data:', error);
    return new Map<number, string>();
  }
}

/**
 * Maps tickets to include proper display names
 * @param tickets - Array of tickets
 * @param gameDisplayNameMap - Map of GameId to DisplayName
 * @returns Array of tickets with updated displayName
 */
export function mapWithDisplayNames(
    items: any[],
  gameDisplayNameMap: Map<number, string>
): any[] {
  return items.map((item: any) => ({
    ...item,
    displayName: gameDisplayNameMap.get(item.gameId) || 'Unknown Game'
  }));
}
