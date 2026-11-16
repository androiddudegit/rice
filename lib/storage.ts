"use client";
import { RiceItem, Project } from "./types";

const ITEMS_KEY = "rice_items";
const PROJECTS_KEY = "rice_projects";

export function loadItems(): RiceItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveItems(items: RiceItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {}
}

export function exportData(): string {
  return JSON.stringify({
    items: loadItems(),
    projects: loadProjects(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importData(json: string): { items: RiceItem[]; projects: Project[] } {
  const data = JSON.parse(json);
  return {
    items: data.items ?? [],
    projects: data.projects ?? [],
  };
}
