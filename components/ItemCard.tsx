"use client";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { RiceItem, Project } from "@/lib/types";
import { scoreColor, scoreBg, STATUS_COLORS, STATUS_LABELS } from "@/lib/rice";
import ScoreGauge from "./ScoreGauge";

interface Props {
  item: RiceItem;
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
  rank?: number;
}

export default function ItemCard({ item, project, onEdit, onDelete, rank }: Props) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="glass rounded-2xl p-5 hover:border-white/10 transition-all group relative animate-in">
      <div className="flex items-start gap-4">
        {rank !== undefined && (
          <span className="text-2xl font-bold text-zinc-700 w-7 shrink-0 text-right mt-0.5">
            {rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
              {item.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ScoreGauge score={item.score} />
              <div className="relative">
                <button
                  onClick={() => setMenu(!menu)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                >
                  <MoreHorizontal size={16} />
                </button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <div className="absolute right-0 top-8 z-20 glass rounded-xl overflow-hidden min-w-[140px] shadow-xl">
                      <button
                        onClick={() => { onEdit(); setMenu(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => { onDelete(); setMenu(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            {project && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-medium text-white/60"
                style={{ background: project.color + "22", border: `1px solid ${project.color}44` }}>
                {project.name}
              </span>
            )}
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-lg text-xs bg-white/5 text-zinc-500">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Reach", value: item.reach.toLocaleString() },
              { label: "Impact", value: item.impact },
              { label: "Conf.", value: `${item.confidence}%` },
              { label: "Effort", value: `${item.effort}m` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] rounded-lg p-2 text-center">
                <div className="text-xs text-zinc-600 mb-0.5">{label}</div>
                <div className="text-sm font-semibold text-zinc-300">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
