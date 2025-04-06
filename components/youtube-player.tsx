"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getPlayer } from "@/utils/getPlayer";
import {
  OnErrorEvent,
  OnStateChangeEvent,
  Player,
  PlayerState,
  Track,
  Movie,
} from "@/types/youtube";

export default function YouTubePlayer({
  type,
  onTrackEnd,
  onClose,
  soundEnabled,
  isBreakTime,
}: {
  type: "music" | "movie";
  onTrackEnd?: () => void;
  onClose?: () => void;
  soundEnabled?: boolean;
  isBreakTime?: boolean;
}) {
  const [items, setItems] = useState<(Track | Movie)[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [volume, setVolume] = useState(70);
  const playerRef = useRef<Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem(type === "music" ? "musicPlaylist" : "breakMovies");
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    }
  }, [type]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        type === "music" ? "musicPlaylist" : "breakMovies",
        JSON.stringify(items),
      );
    }
  }, [items, type]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      const playerDiv = document.createElement("div");
      playerDiv.id = `${type}-player`;
      playerDiv.style.display = "none";

      if (playerContainerRef.current) {
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = getPlayer(`${type}-player`, {
          height: "0",
          width: "0",
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
          },
          events: {
            onStateChange: (event: OnStateChangeEvent) => {
              if (event.data === PlayerState.ENDED) {
                playNextItem();
              } else if (event.data === PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: OnErrorEvent) => {
              console.error("YouTube player error:", event.data);
              playNextItem();
            },
          },
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [type]);

  useEffect(() => {
    if (isBreakTime && type === "movie" && items.length > 0 && currentItemIndex === -1) {
      setCurrentItemIndex(0);
    }
  }, [isBreakTime, items, currentItemIndex, type]);

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(http:\/\/googleusercontent.com\/youtube.com\/3\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url);
    return videoId
      ? `<span class="math-inline">\{type \=\=\= "music" ? "YouTube" \: "Movie"\} \(</span>{videoId.substring(0, 6)}...)`
      : "Unknown Item";
  };

  const addItem = () => {
    if (!newItemUrl.trim()) return;

    const itemId = extractVideoId(newItemUrl);

    if (!itemId) {
      alert("Invalid YouTube URL");
      return;
    }

    const title = extractTitle(newItemUrl);
    const newItem = { id: itemId, title, url: newItemUrl };

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

  const loadAndPlayItem = (index: number) => {
    if (!items[index] || !playerRef.current) return;

    const item = items[index];
    const videoId = extractVideoId(item.url);

    if (videoId) {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.setVolume(volume);
      setIsPlaying(true);
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

  const playNextItem = () => {
    if (items.length === 0) return;

    const newIndex = (currentItemIndex + 1) % items.length;
    setCurrentItemIndex(newIndex);
    loadAndPlayItem(newIndex);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(soundEnabled ? volume : 0);
    }
  }, [volume, soundEnabled]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.addEventListener("onStateChange", (event: any) => {
        if (event.data === PlayerState.ENDED) {
          if (type === "music" && onTrackEnd) {
            onTrackEnd();
          } else {
            playNextItem();
          }
        }
      });
    }
  }, [playerRef, onTrackEnd, type]);

  useEffect(() => {
    if (currentItemIndex >= 0 && playerRef.current) {
      loadAndPlayItem(currentItemIndex);
    }
  }, [currentItemIndex, items]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col space-y-3 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-primary/80 mx-auto text-lg font-medium">
          {type === "music" ? "Audio Only" : "YouTube Break"}
        </h2>
        {type === "movie" && isBreakTime && onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-primary/50 hover:text-primary/70 hover:bg-primary/10 h-7 px-2"
          >
            Close
          </Button>
        )}
      </div>

      {/* Player container */}
      <div ref={playerContainerRef} className="hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newItemUrl}
          onChange={(e) => setNewItemUrl(e.target.value)}
          placeholder={`Paste YouTube ${type === "music" ? "URL" : "movie URL"}`}
          className="bg-background/50 text-primary placeholder:text-primary/30 h-8 grow border text-sm"
        />
        <Button
          onClick={addItem}
          className="bg-primary/10 text-primary hover:bg-primary/30 size-8 border-none p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Current item info */}
      <div className="py-1 text-center">
        <p className="text-primary/80 truncate text-sm">
          {currentItemIndex >= 0 && items[currentItemIndex]
            ? items[currentItemIndex].title
            : `No ${type === "music" ? "track" : "movie"} selected`}
        </p>
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="h-1.5"
        />
        <p className="text-primary/50 text-right text-xs">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousItem}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={items.length === 0}
        >
          <SkipBack className="size-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={items.length === 0}
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>

        <Button
          onClick={playNextItem}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={items.length === 0}
        >
          <SkipForward className="size-3" />
        </Button>
      </div>

      {/* Item list */}
      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-primary/50 text-center text-sm italic">
            No {type === "music" ? "tracks" : "movies"} added
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between rounded p-1.5 ${
                index === currentItemIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="text-primary/70 hover:text-primary/90 flex flex-1 cursor-pointer items-center gap-1 truncate text-xs"
                onClick={() => {
                  setCurrentItemIndex(index);
                  loadAndPlayItem(index);
                }}
              >
                {type === "music" ? (
                  <Music className="size-3 shrink-0" />
                ) : (
                  <Film className="size-3 shrink-0" />
                )}
                <span>{item.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="text-primary/50 hover:text-primary/70 size-6 opacity-0 group-hover:opacity-100 hover:bg-transparent"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
