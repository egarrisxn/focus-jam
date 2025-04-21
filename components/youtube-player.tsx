"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music } from "lucide-react";
import { fetchYouTubeVideoTitle } from "@/utils/youtubeAPI";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import type { Track, OnStateChangeEvent, Player } from "@/types/youtube";

enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export const YouTubePlayer = React.memo(
  ({
    onTrackEnd,
    soundEnabled,
    url,
  }: {
    onTrackEnd?: () => void;
    soundEnabled?: boolean;
    url?: string | null;
  }) => {
    const [items, setItems] = useState<Track[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [newItemUrl, setNewItemUrl] = useState("");
    const [volume, setVolume] = useState(70);
    const playerRef = useRef<Player | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const isPlayerReady = useRef(false);

    const extractVideoId = useCallback((url: string): string | null => {
      const regExp =
        /^.*(http:\/\/googleusercontent.com\/youtube.com\/3\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    }, []);

    const loadAndPlayItem = useCallback(
      (index: number) => {
        if (!items[index] || !playerRef.current) return;
        const item = items[index];
        const videoId = extractVideoId(item.url);
        if (videoId) {
          playerRef.current.loadVideoById(videoId);
          playerRef.current.setVolume(volume);
          setIsPlaying(true);
        }
      },
      [items, playerRef, volume, extractVideoId],
    );

    const playNextItem = useCallback(() => {
      if (items.length === 0) return;
      const newIndex = (currentItemIndex + 1) % items.length;
      setCurrentItemIndex(newIndex);
      loadAndPlayItem(newIndex);
    }, [currentItemIndex, items, loadAndPlayItem]);

    useEffect(() => {
      if (typeof window !== "undefined" && !window.YT) {
        const tag = document.createElement("script");
        tag.src = "http://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          isPlayerReady.current = true;
          initializePlayer();
        };
      } else if (typeof window !== "undefined" && window.YT && !playerRef.current) {
        isPlayerReady.current = true;
        initializePlayer();
      }

      function initializePlayer() {
        if (playerContainerRef.current) {
          const playerDiv = document.createElement("div");
          playerDiv.id = `music-player`;
          playerDiv.style.display = "none";
          playerContainerRef.current.appendChild(playerDiv);
          playerRef.current = new window.YT.Player(`music-player`, {
            height: "0",
            width: "0",
            playerVars: {
              playsinline: 1,
              controls: 0,
              disablekb: 1,
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
              onError: onPlayerError,
            },
          });
        }
      }

      function onPlayerReady() {
        if (url && playerRef.current) {
          const videoId = extractVideoId(url);
          if (videoId) {
            playerRef.current.loadVideoById(videoId);
          }
        }
        if (playerRef.current) {
          playerRef.current.setVolume(soundEnabled ? volume : 0);
        }
      }

      function onPlayerStateChange(event: OnStateChangeEvent) {
        if (event.data === PlayerState.ENDED) {
          playNextItem();
        } else if (event.data === PlayerState.PLAYING) {
          setIsPlaying(true);
        } else if (event.data === PlayerState.PAUSED) {
          setIsPlaying(false);
        }
      }

      function onPlayerError() {
        playNextItem();
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    }, [soundEnabled, url, playNextItem, extractVideoId, volume]);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const savedItems = localStorage.getItem("musicPlaylist");
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
      }
    }, []);

    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("musicPlaylist", JSON.stringify(items));
      }
    }, [items]);

    const YOUTUBE_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";

    const addItem = async () => {
      if (!newItemUrl.trim()) return;
      const videoId = extractVideoId(newItemUrl);
      if (!videoId) {
        alert("Invalid YouTube URL");
        return;
      }
      const title = await fetchYouTubeVideoTitle(videoId, YOUTUBE_KEY);
      const newItem = {
        id: videoId,
        title: title || `(No Title) ${videoId.substring(0, 8)}...`,
        url: newItemUrl,
      };
      setItems([...items, newItem]);
      setNewItemUrl("");
      if (items.length === 0) {
        setCurrentItemIndex(0);
      }
    };

    const removeItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
      if (index === currentItemIndex) {
        if (isPlaying && playerRef.current) {
          playerRef.current.stopVideo();
          setIsPlaying(false);
        }
        if (newItems.length > 0) {
          setCurrentItemIndex(0);
        } else {
          setCurrentItemIndex(-1);
        }
      } else if (index < currentItemIndex) {
        setCurrentItemIndex(currentItemIndex - 1);
      }
    };

    const togglePlay = () => {
      if (currentItemIndex === -1 && items.length > 0) {
        setCurrentItemIndex(0);
        loadAndPlayItem(0);
        return;
      }
      if (!items[currentItemIndex]) return;
      if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      }
      setIsPlaying(!isPlaying);
    };

    const playPreviousItem = () => {
      if (items.length === 0) return;
      const newIndex = currentItemIndex <= 0 ? items.length - 1 : currentItemIndex - 1;
      setCurrentItemIndex(newIndex);
      loadAndPlayItem(newIndex);
    };

    useEffect(() => {
      if (playerRef.current) {
        playerRef.current.addEventListener("onStateChange", (event: any) => {
          if (event.data === PlayerState.ENDED) {
            if (onTrackEnd) {
              onTrackEnd();
            } else {
              playNextItem();
            }
          }
        });
      }
    }, [playerRef, onTrackEnd, playNextItem]);

    useEffect(() => {
      if (currentItemIndex >= 0 && playerRef.current) {
        loadAndPlayItem(currentItemIndex);
      }
    }, [currentItemIndex, items, loadAndPlayItem]);

    useEffect(() => {
      if (playerRef.current) {
        playerRef.current.setVolume(soundEnabled ? volume : 0);
      }
    }, [volume, soundEnabled]);

    return (
      <Card className="h-fit w-full max-w-96 min-w-80 sm:max-w-96 sm:min-w-96 xl:min-w-[26em]">
        <CardHeader className="xl:hidden">
          <CardTitle className="mx-auto text-lg font-medium">YouTube Music</CardTitle>
        </CardHeader>

        <div ref={playerContainerRef} className="hidden"></div>

        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder="Paste YouTube Music URL"
              className="grow"
            />
            <Button onClick={addItem} size="icon">
              <Plus />
            </Button>
          </div>
          <div className="py-3">
            <p className="text-primary/80 mx-auto flex w-full max-w-68 items-center justify-center truncate text-sm">
              {currentItemIndex >= 0 && items[currentItemIndex]
                ? items[currentItemIndex].title
                : "No track selected"}
            </p>
          </div>

          <div className="space-y-1">
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
            />
            <p className="text-primary/50 text-right text-xs">Vol: {volume}%</p>
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={playPreviousItem} size="icon" disabled={items.length === 0}>
              <SkipBack />
            </Button>

            <Button onClick={togglePlay} size="icon" disabled={items.length === 0}>
              {isPlaying ? <Pause /> : <Play />}
            </Button>

            <Button onClick={playNextItem} size="icon" disabled={items.length === 0}>
              <SkipForward />
            </Button>
          </div>

          <div className="max-h-32 space-y-1 overflow-y-auto py-2">
            {items.length === 0 ? (
              <p className="text-primary/50 pt-2 text-center text-sm italic">No tracks added</p>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between rounded p-1.5 ${
                    index === currentItemIndex ? "bg-primary/10" : ""
                  }`}
                >
                  <div
                    className="text-primary/70 hover:text-primary/90 flex flex-1 cursor-pointer items-center gap-1"
                    onClick={() => {
                      setCurrentItemIndex(index);
                      loadAndPlayItem(index);
                    }}
                  >
                    <Music className="size-3 shrink-0" />
                    <p className="text-primary/80 w-full max-w-56 truncate text-xs">{item.title}</p>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="text-primary/50 hover:text-primary/70 size-4 p-2.5 opacity-0 group-hover:opacity-100 hover:bg-transparent"
                  >
                    <Trash2 className="size-2" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

YouTubePlayer.displayName = "YouTubePlayer";
