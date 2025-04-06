export interface Track {
  id: string;
  title: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  url: string;
}

export interface PlayerOptions {
  width?: string | number;
  height?: string | number;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    fs?: 0 | 1;
    iv_load_policy?: 1 | 3;
    modestbranding?: 0 | 1;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    loop?: 0 | 1;
    [key: string]: number | string | boolean | undefined;
  };
  events?: {
    onReady?: (event: Event) => void;
    onStateChange?: (event: OnStateChangeEvent) => void;
    onPlaybackQualityChange?: (event: Event) => void;
    onPlaybackRateChange?: (event: Event) => void;
    onError?: (event: OnErrorEvent) => void;
    onApiChange?: (event: Event) => void;
  };
}

export interface Player {
  addEventListener(arg0: string, arg1: (event: any) => void): unknown;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;
  loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number): void;
  cuePlaylist(playlist: string | string[], index?: number, startSeconds?: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist(): string[];
  getPlaylistIndex(): number;
  destroy(): void;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface OnStateChangeEvent {
  data: PlayerState;
  target: Player;
}

export interface OnErrorEvent {
  data: number;
  target: Player;
}

export interface Event {
  data: unknown;
  target: Player;
}

export interface PlayerConstructor {
  new (elementId: string | HTMLElement, options: PlayerOptions): Player;
}

declare global {
  export interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: { Player: PlayerConstructor };
  }
}
