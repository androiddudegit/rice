"use client";
import { useState, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import {
  Plus, LayoutGrid, Table2, BarChart3, Download, Upload,
  Folder, ChevronDown, Search, SlidersHorizontal, Trash2, X,
  TrendingUp, Layers, CheckCircle, Archive
} from "lucide-react";

import { RiceItem, Project, SortKey, SortDir, View } from "@/lib/types";
import { calcScore, nextProjectColor, STATUS_LABELS } from "@/lib/rice";
import { loadItems, saveItems, loadProjects, saveProjects, exportData, importData } from "@/lib/storage";
import ItemCard from "@/components/ItemCard";
import ItemModal from "@/components/ItemModal";
import ProjectModal from "@/components/ProjectModal";
import TableView from "@/components/TableView";

const DEFAULT_PROJECT: Project = {
  id: "default",
  name: "General",
  description: "Default project",
  color: "#6366f1",
  createdAt: new Date().toISOString(),
};

export default function Home() {
  const [items, setItems] = useState<RiceItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT]);
  const [mounted, setMounted] = useState(false);

  const [view, setView] = useState<View>("board");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [addItem, setAddItem] = useState(false);
  const [editItem, setEditItem] = useState<RiceItem | null>(null);
  const [addProject, setAddProject] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    const storedItems = loadItems();
    const storedProjects = loadProjects();
    if (storedItems.length) setItems(storedItems);
    if (storedProjects.length) setProjects(storedProjects);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveItems(items);
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) saveProjects(projects);
  }, [projects, mounted]);

  function handleSaveItem(data: Omit<RiceItem, "id" | "createdAt" | "updatedAt">) {
    if (editItem) {
      setItems(prev => prev.map(i =>
        i.id === editItem.id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
      ));
      setEditItem(null);
    } else {
      const now = new Date().toISOString();
      setItems(prev => [...prev, { ...data, id: uuid(), createdAt: now, updatedAt: now }]);
      setAddItem(false);
    }
  }

  function handleDeleteItem(id: string) {
    if (confirm("Delete this initiative?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  }

  function handleSaveProject(data: Omit<Project, "id" | "createdAt">) {
    if (editProject) {
      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...data } : p));
      setEditProject(null);
    } else {
      setProjects(prev => [...prev, { ...data, id: uuid(), createdAt: new Date().toISOString() }]);
      setAddProject(false);
    }
  }

  function handleDeleteProject(id: string) {
    if (id === "default") return;
    const count = items.filter(i => i.projectId === id).length;
    if (confirm(`Delete project? ${count} initiative(s) will be moved to General.`)) {
      setItems(prev => prev.map(i => i.projectId === id ? { ...i, projectId: "default" } : i));
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleExport() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rice-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const { items: newItems, projects: newProjects } = importData(ev.target?.result as string);
        setItems(newItems);
        setProjects(newProjects.length ? newProjects : [DEFAULT_PROJECT]);
        alert(`Imported ${newItems.length} initiatives across ${newProjects.length} projects.`);
      } catch {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => i.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const projectMap = useMemo(() =>
    Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (!showArchived) list = list.filter(i => i.status !== "archived");
    if (filterProject !== "all") list = list.filter(i => i.projectId === filterProject);
    if (filterStatus !== "all") list = list.filter(i => i.status === filterStatus);
    if (filterTag !== "all") list = list.filter(i => i.tags.includes(filterTag));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const av = a[sortKey as keyof RiceItem] as number | string;
      const bv = b[sortKey as keyof RiceItem] as number | string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [items, filterProject, filterStatus, filterTag, search, sortKey, sortDir, showArchived]);

  const stats = useMemo(() => ({
    total: items.filter(i => i.status !== "archived").length,
    inProgress: items.filter(i => i.status === "in-progress").length,
    done: items.filter(i => i.status === "done").length,
    archived: items.filter(i => i.status === "archived").length,
    topScore: items.length ? Math.max(...items.map(i => i.score)) : 0,
  }), [items]);

  const isFiltered = filterProject !== "all" || filterStatus !== "all" || filterTag !== "all" || search;

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold gradient-text">RICE</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Priority scoring · Reach × Impact × Confidence ÷ Effort</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Project selector */}
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-sm text-zinc-300 hover:border-white/15 transition-all"
              >
                <Folder size={15} style={{ color: projectMap[filterProject]?.color ?? "#6366f1" }} />
                <span className="max-w-[120px] truncate">
                  {filterProject === "all" ? "All projects" : projectMap[filterProject]?.name ?? "?"}
                </span>
                <ChevronDown size={14} />
              </button>
              {showProjectMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowProjectMenu(false)} />
                  <div className="absolute right-0 top-11 z-30 glass rounded-2xl min-w-[220px] shadow-2xl overflow-hidden">
                    <div className="p-2">
                      <button
                        onClick={() => { setFilterProject("all"); setShowProjectMenu(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors ${filterProject === "all" ? "bg-indigo-600/30 text-indigo-300" : "text-zinc-400 hover:bg-white/5"}`}
                      >
                        All projects
                      </button>
                      {projects.map(p => (
                        <div key={p.id} className="flex items-center gap-1">
                          <button
                            onClick={() => { setFilterProject(p.id); setShowProjectMenu(false); }}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${filterProject === p.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"}`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                            <span className="flex-1 text-left truncate">{p.name}</span>
                            <span className="text-zinc-600 text-xs">{items.filter(i => i.projectId === p.id).length}</span>
                          </button>
                          {p.id !== "default" && (
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/5 p-2">
                      <button
                        onClick={() => { setAddProject(true); setShowProjectMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-indigo-400 hover:bg-indigo-600/20 transition-colors"
                      >
                        <Plus size={14} /> New project
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Import/Export */}
            <label className="cursor-pointer glass p-2 rounded-xl text-zinc-400 hover:text-white hover:border-white/15 transition-all" title="Import JSON">
              <Upload size={16} />
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleExport} className="glass p-2 rounded-xl text-zinc-400 hover:text-white hover:border-white/15 transition-all" title="Export JSON">
              <Download size={16} />
            </button>

            <button
              onClick={() => setAddItem(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add initiative
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, icon: Layers, color: "text-indigo-400" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-blue-400" },
            { label: "Done", value: stats.done, icon: CheckCircle, color: "text-green-400" },
            { label: "Top Score", value: stats.topScore, icon: BarChart3, color: "text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${
              isFiltered
                ? "bg-indigo-600/30 border-indigo-500/40 text-indigo-300"
                : "glass text-zinc-400 hover:text-white hover:border-white/15"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {isFiltered && <span className="bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>

          <div className="flex-1" />

          {/* Show archived */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${
              showArchived ? "bg-white/10 border-white/20 text-white" : "glass text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Archive size={14} />
            {stats.archived} archived
          </button>

          {/* View toggle */}
          <div className="glass rounded-xl flex p-1 gap-1">
            {([["board", LayoutGrid], ["table", Table2]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-all ${view === v ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {showFilterPanel && (
          <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap gap-4 animate-in">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500/60"
              >
                <option value="all" style={{ background: "#12121a" }}>All statuses</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: "#12121a" }}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Tag</label>
              <select
                value={filterTag}
                onChange={e => setFilterTag(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500/60"
              >
                <option value="all" style={{ background: "#12121a" }}>All tags</option>
                {allTags.map(t => (
                  <option key={t} value={t} style={{ background: "#12121a" }}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Sort by</label>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500/60"
              >
                {["score", "name", "reach", "impact", "confidence", "effort", "createdAt"].map(k => (
                  <option key={k} value={k} style={{ background: "#12121a" }}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilterProject("all"); setFilterStatus("all"); setFilterTag("all"); setSearch(""); }}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Count */}
        <div className="text-xs text-zinc-600 mb-4">
          {filtered.length} of {items.filter(i => showArchived || i.status !== "archived").length} initiatives
        </div>

        {/* Content */}
        {view === "board" ? (
          filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  project={projectMap[item.projectId]}
                  rank={sortKey === "score" ? i + 1 : undefined}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onAdd={() => setAddItem(true)} />
          )
        ) : (
          <TableView
            items={filtered}
            projects={projects}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={setEditItem}
            onDelete={id => handleDeleteItem(id)}
          />
        )}
      </div>

      {/* Modals */}
      {(addItem || editItem) && (
        <ItemModal
          item={editItem}
          projects={projects}
          defaultProjectId={filterProject !== "all" ? filterProject : undefined}
          onSave={handleSaveItem}
          onClose={() => { setAddItem(false); setEditItem(null); }}
        />
      )}
      {(addProject || editProject) && (
        <ProjectModal
          project={editProject}
          onSave={handleSaveProject}
          onClose={() => { setAddProject(false); setEditProject(null); }}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🌾</div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">No initiatives yet</h3>
      <p className="text-sm text-zinc-600 mb-6 max-w-sm">
        Start scoring your ideas with the RICE framework — Reach, Impact, Confidence, and Effort.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        <Plus size={16} /> Add your first initiative
      </button>
    </div>
  );
}
