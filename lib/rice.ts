import { RiceItem, Project } from "./types";

export function calcScore(reach: number, impact: number, confidence: number, effort: number): number {
  if (effort === 0) return 0;
  return Math.round((reach * impact * (confidence / 100)) / effort * 10) / 10;
}

export function scoreColor(score: number): string {
  if (score >= 50) return "score-high";
  if (score >= 20) return "score-medium";
  return "score-low";
}

export function scoreBg(score: number): string {
  if (score >= 50) return "bg-green-500/10 border-green-500/20";
  if (score >= 20) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#22c55e", "#06b6d4", "#f59e0b", "#ef4444",
];

export function nextProjectColor(projects: Project[]): string {
  return PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
}

export const IMPACT_LABELS: Record<number, string> = {
  3: "Massive",
  2: "High",
  1: "Medium",
  0.5: "Low",
  0.25: "Minimal",
};

export const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  done: "Done",
  archived: "Archived",
};

export const STATUS_COLORS: Record<string, string> = {
  backlog: "text-zinc-400 bg-zinc-800",
  "in-progress": "text-indigo-400 bg-indigo-900/40",
  done: "text-green-400 bg-green-900/40",
  archived: "text-zinc-500 bg-zinc-900",
};
