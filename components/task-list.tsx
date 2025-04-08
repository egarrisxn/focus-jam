"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import type React from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("focusTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("focusTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <div className="grid grid-cols-1">
      <Card className="w-full max-w-96 min-w-68 sm:max-w-96 sm:min-w-96">
        <CardHeader>
          <CardTitle className="mx-auto text-lg font-medium">Task List</CardTitle>
        </CardHeader>
        <div className="flex space-x-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyUp={handleKeyUp} // Changed from onKeyPress to onKeyUp
            placeholder="Add task..."
            className="grow"
          />
          <Button onClick={addTask} size="icon">
            <Plus />
          </Button>
        </div>

        <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-primary/50 text-center text-sm italic">No tasks</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center rounded p-1.5 ${task.completed ? "bg-primary/5" : ""}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mr-2"
                />
                <span
                  className={`text-primary flex-1 text-sm ${task.completed ? "text-primary/40 line-through" : ""}`}
                >
                  {task.text}
                </span>
                <Button
                  size="icon"
                  onClick={() => removeTask(task.id)}
                  className="text-primary/50 hover:text-primary/70 size-4 p-2.5 opacity-0 group-hover:opacity-100 hover:bg-transparent"
                >
                  <Trash2 className="size-2" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
