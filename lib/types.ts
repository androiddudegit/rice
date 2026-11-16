export interface RiceItem {
  id: string;
  name: string;
  description: string;
  projectId: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;
  tags: string[];
  status: "backlog" | "in-progress" | "done" | "archived";
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export type SortKey = "score" | "name" | "reach" | "impact" | "confidence" | "effort" | "createdAt";
export type SortDir = "asc" | "desc";

export type View = "board" | "table" | "compare";
