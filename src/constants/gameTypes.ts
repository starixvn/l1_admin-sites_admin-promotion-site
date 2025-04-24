export const GAME_TYPES = {
    CLASSIC: 2,
    CASCADING: 3,
  } as const;
  
  export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
  