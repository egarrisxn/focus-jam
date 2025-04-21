"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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

import { TimerMode, TimerPreset, type TimerSettings } from "@/types/timer";

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60,
  breakTime: 10 * 60,
  preset: "50/10",
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
  const [customWorkTime, setCustomWorkTime] = useState(Math.floor(settings.workTime / 60));
  const [customBreakTime, setCustomBreakTime] = useState(Math.floor(settings.breakTime / 60));

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
      if (mode === "work") {
        setMode("break");
        setTimeLeft(settings.breakTime);
      } else {
        setMode("work");
        setTimeLeft(settings.workTime);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, settings]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setTimeLeft(settings.workTime);
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
        newSettings = { workTime: 25 * 60, breakTime: 5 * 60, preset };
        break;
      case "50/10":
        newSettings = { workTime: 50 * 60, breakTime: 10 * 60, preset };
        break;
      case "90/20":
        newSettings = { workTime: 90 * 60, breakTime: 20 * 60, preset };
        break;
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
        };
        break;
      default:
        newSettings = DEFAULT_SETTINGS;
    }
    setSettings(newSettings);
    setIsActive(false);
    setMode("work");
    setTimeLeft(newSettings.workTime);
  };

  return (
    <Card className="h-fit w-full max-w-96 min-w-80 sm:max-w-96 sm:min-w-96 xl:min-w-[26em]">
      <Progress value={calculateProgress()} />
      <CardHeader>
        <CardTitle className="mx-auto text-3xl font-medium">
          {mode === "work" ? "Focus Timer" : "Break Time"}
        </CardTitle>
        <CardDescription
          className="mx-auto text-7xl font-medium"
          dangerouslySetInnerHTML={{ __html: formatTime(timeLeft) }}
        />
      </CardHeader>

      <CardContent className="mx-auto space-x-3">
        <Button onClick={toggleTimer} size="icon">
          {isActive ? <Pause /> : <Play />}
        </Button>
        <Button onClick={resetTimer} size="icon">
          <RotateCcw />
        </Button>
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
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
