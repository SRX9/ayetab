"use client";

import type { ComponentType } from "react";
import type { CustomToolProps } from "../components/productivity/shared";
import { ExcalidrawTool } from "../components/excalidraw-tool";
import { TodoListTool } from "../components/productivity/todo-list-tool";
import { KanbanTool } from "../components/productivity/kanban-tool";
import { PomodoroTool } from "../components/productivity/pomodoro-tool";
import { QuickNotesTool } from "../components/productivity/quick-notes-tool";
import { StopwatchTool } from "../components/productivity/stopwatch-tool";
import { HabitTrackerTool } from "../components/productivity/habit-tracker-tool";

export const CUSTOM_TOOL_COMPONENTS: Record<string, ComponentType<CustomToolProps>> = {
  excalidraw: ExcalidrawTool,
  "todo-list": TodoListTool,
  "kanban-board": KanbanTool,
  pomodoro: PomodoroTool,
  "quick-notes": QuickNotesTool,
  stopwatch: StopwatchTool,
  "habit-tracker": HabitTrackerTool,
};

export const CUSTOM_TOOL_TEST_IDS: Record<string, string> = {
  excalidraw: "excalidraw-canvas",
  "todo-list": "todo-list",
  "kanban-board": "kanban-board",
  pomodoro: "pomodoro-timer",
  "quick-notes": "quick-notes",
  stopwatch: "stopwatch",
  "habit-tracker": "habit-tracker",
};
