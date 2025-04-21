import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import Pomodoro from "@/components/pomodoro-timer";
import TaskList from "@/components/task-list";
import { YouTubePlayer } from "@/components/youtube-player";

export default function FocusPage() {
  return (
    <div className="grid min-h-screen w-full place-items-center">
      <nav className="fixed top-0 z-10 flex w-full flex-row items-center justify-between border-b-4 border-black bg-white p-4 dark:border-white dark:bg-black">
        <div className="flex items-center gap-1 text-2xl font-black tracking-tighter text-black dark:text-white">
          <Image src="/icons/focus-icon.png" alt="Focus Icon" width={32} height={32} />
          Focus Jam
        </div>
        <ThemeToggle />
      </nav>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 sm:px-0 xl:mt-16 xl:flex-row xl:items-stretch 2xl:mt-0 2xl:pt-0">
        <div className="flex flex-col gap-6 xl:order-2">
          <Pomodoro />
          <YouTubePlayer />
        </div>
        <div className="flex xl:order-1">
          <TaskList />
        </div>
      </div>
    </div>
  );
}
