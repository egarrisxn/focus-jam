import { Player, PlayerOptions } from "../types/youtube";

export const getPlayer = (elementId: string | HTMLElement, options: PlayerOptions): Player => {
  return new window.YT.Player(elementId, options);
};
