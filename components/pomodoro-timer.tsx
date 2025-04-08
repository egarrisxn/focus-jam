"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Film } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import YouTube from "@/components/youtube-player";

type TimerMode = "work" | "break";
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom";

interface TimerSettings {
  workTime: number;
  breakTime: number;
  preset: TimerPreset;
  enableMovieBreaks: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60,
  breakTime: 10 * 60,
  preset: "50/10",
  enableMovieBreaks: false,
};

export default function Pomodoro() {
  const loadSettings = (): TimerSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    const saved = localStorage.getItem("pomodoroSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  };

  const [settings, setSettings] = useState<TimerSettings>(loadSettings());
  const [timeLeft, setTimeLeft] = useState(settings.workTime);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customWorkTime, setCustomWorkTime] = useState(50);
  const [customBreakTime, setCustomBreakTime] = useState(10);
  const [showVisualPlayer, setShowVisualPlayer] = useState(false);
  const [musicTrackEnded, setMusicTrackEnded] = useState(false);

  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);
    setTimeLeft(savedSettings.workTime);
    setCustomWorkTime(Math.floor(savedSettings.workTime / 60));
    setCustomBreakTime(Math.floor(savedSettings.breakTime / 60));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Switch modes
      if (mode === "work") {
        setMode("break");
        setTimeLeft(settings.breakTime);
        setShowVisualPlayer(false);
      } else {
        setMode("work");
        setTimeLeft(settings.workTime);
        if (settings.enableMovieBreaks) {
          setTimeout(() => {
            setShowVisualPlayer(true);
          }, 100);
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, soundEnabled, settings]);

  useEffect(() => {
    if (musicTrackEnded) {
      console.log("Music ended:", musicTrackEnded);
      setMusicTrackEnded(false);
    }
  }, [musicTrackEnded]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setTimeLeft(settings.workTime);
    setShowVisualPlayer(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime;
    return ((total - timeLeft) / total) * 100;
  };

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings;

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      default:
        newSettings = DEFAULT_SETTINGS;
    }

    setSettings(newSettings);

    // Reset timer with new settings
    setIsActive(false);
    setMode("work");
    setTimeLeft(newSettings.workTime);
  };

  const toggleMovieBreaks = (enabled: boolean) => {
    setSettings({
      ...settings,
      enableMovieBreaks: enabled,
    });

    if (!enabled && showVisualPlayer) {
      setShowVisualPlayer(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="h-fit w-full max-w-96 min-w-68">
        <Progress value={calculateProgress()} />
        <CardHeader>
          <CardTitle className="mx-auto text-5xl font-medium">{formatTime(timeLeft)}</CardTitle>
          <CardDescription className="mx-auto text-xs uppercase">
            {mode === "work" ? "focus" : "break"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mx-auto space-x-3">
          <Button onClick={toggleTimer} size="icon">
            {isActive ? <Pause /> : <Play />}
          </Button>

          <Button onClick={resetTimer} size="icon">
            <RotateCcw />
          </Button>

          <Button onClick={toggleSound} size="icon">
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </Button>

          {settings.enableMovieBreaks && mode === "break" && (
            <Button onClick={() => setShowVisualPlayer(!showVisualPlayer)} size="icon">
              <Film />
            </Button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
              >
                <Settings />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Preset Timers</Label>
                  <Select
                    value={settings.preset}
                    onValueChange={(value) => applyPreset(value as TimerPreset)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25/5">25/5 (Pomodoro)</SelectItem>
                      <SelectItem value="50/10">50/10 (Extended)</SelectItem>
                      <SelectItem value="90/20">90/20 (Deep Work)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.preset === "custom" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Work Time: {customWorkTime} minutes</Label>
                      </div>
                      <Slider
                        value={[customWorkTime]}
                        min={5}
                        max={120}
                        step={5}
                        onValueChange={(value) => setCustomWorkTime(value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Break Time: {customBreakTime} minutes</Label>
                      </div>
                      <Slider
                        value={[customBreakTime]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(value) => setCustomBreakTime(value[0])}
                      />
                    </div>
                    <Button onClick={() => applyPreset("custom")} className="w-full">
                      Apply Custom Settings
                    </Button>
                  </>
                )}

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="movie-breaks">Enable Movie Breaks</Label>
                  <Switch
                    id="movie-breaks"
                    checked={settings.enableMovieBreaks}
                    onCheckedChange={toggleMovieBreaks}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <YouTube
        type="music"
        soundEnabled={soundEnabled}
        onTrackEnd={() => setMusicTrackEnded(true)}
      />
      {showVisualPlayer && mode === "work" && (
        <YouTube type="movie" isBreakTime={true} onClose={() => setShowVisualPlayer(false)} />
      )}
    </div>
  );
}
