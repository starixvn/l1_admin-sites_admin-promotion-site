export const SABA_PLAY = "sabaplay";

export function isSabaPlay(operatorId: string): boolean {
  return operatorId.toLowerCase() === SABA_PLAY;
}
