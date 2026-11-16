"use client";
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { RiceItem, Project, SortKey, SortDir } from "@/lib/types";
import { scoreColor, STATUS_COLORS, STATUS_LABELS } from "@/lib/rice";

interface Props {
  items: RiceItem[];
  projects: Project[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onEdit: (item: RiceItem) => void;
  onDelete: (id: string) => void;
}

const COLS: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "Name" },
  { key: "score", label: "Score", className: "text-center" },
  { key: "reach", label: "Reach", className: "text-right" },
  { key: "impact", label: "Impact", className: "text-right" },
  { key: "confidence", label: "Conf.", className: "text-right" },
  { key: "effort", label: "Effort", className: "text-right" },
];

export default function TableView({ items, projects, sortKey, sortDir, onSort, onEdit, onDelete }: Props) {
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left w-8 text-zinc-600">#</th>
              {COLS.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-zinc-400 cursor-pointer hover:text-white transition-colors select-none ${col.className ?? "text-left"}`}
                  onClick={() => onSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                    ) : (
                      <span className="w-[14px]" />
                    )}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-zinc-400">Project</th>
              <th className="px-4 py-3 text-left text-zinc-400">Status</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const proj = projectMap[item.projectId];
              const sc = scoreColor(item.score);
              return (
                <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 text-zinc-700 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-zinc-600 truncate max-w-xs">{item.description}</div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-center font-bold ${sc}`}>{item.score}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{item.reach.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{item.impact}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{item.confidence}%</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{item.effort}m</td>
                  <td className="px-4 py-3">
                    {proj && (
                      <span className="px-2 py-0.5 rounded-lg text-xs" style={{ background: proj.color + "22", color: proj.color }}>
                        {proj.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-16 text-zinc-600">No initiatives yet</div>
        )}
      </div>
    </div>
  );
}
