import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? `${h}h` : null,
    m > 0 ? `${m}m` : null,
    s > 0 || (h === 0 && m === 0) ? `${s}s` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatTimeDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function calculateEfficiency(estimatedHours: number, actualSeconds: number): number {
  if (actualSeconds === 0) return 0;
  return estimatedHours / (actualSeconds / 3600);
}

export function getDevTime(task: { classification: string; totalSeconds: number; phaseSeconds: Record<string, number> }): number {
  if (task.classification === 'sprintly') {
    return task.phaseSeconds['In progress'] || 0;
  }
  return task.totalSeconds;
}

export function getWaitTime(task: { classification: string; phaseSeconds: Record<string, number> }): number {
  if (task.classification === 'sprintly') {
    return (task.phaseSeconds['Code Review'] || 0) + (task.phaseSeconds['Testing'] || 0);
  }
  return 0;
}
