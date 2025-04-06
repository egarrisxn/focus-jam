import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import Pomodoro from "@/components/pomodoro-timer";
import TaskList from "@/components/task-list";

export default function FocusPage() {
  return (
    <div className="grid min-h-screen w-full">
      <nav className="fixed top-0 z-10 flex w-full flex-row items-center justify-between p-4">
        <div className="flex items-center gap-1 text-2xl font-black tracking-tighter text-pink-500">
          <Image src="/icons/focus-icon.png" alt="Focus Icon" width={32} height={32} />
          Focus Jam
        </div>
        <ThemeToggle />
      </nav>
      <div className="max-w-8xl mx-auto flex w-full flex-col items-center justify-center gap-6 px-4 py-24">
        <Pomodoro />
        <TaskList />
      </div>
    </div>
  );
}
