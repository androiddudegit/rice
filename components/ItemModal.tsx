"use client";
import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { RiceItem, Project } from "@/lib/types";
import { calcScore, IMPACT_LABELS } from "@/lib/rice";
import ScoreGauge from "./ScoreGauge";

interface Props {
  item?: RiceItem | null;
  projects: Project[];
  defaultProjectId?: string;
  onSave: (item: Omit<RiceItem, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

const IMPACT_OPTIONS = [
  { value: 3, label: "Massive", desc: "Game-changing for most users" },
  { value: 2, label: "High", desc: "Significant improvement" },
  { value: 1, label: "Medium", desc: "Noticeable improvement" },
  { value: 0.5, label: "Low", desc: "Minor improvement" },
  { value: 0.25, label: "Minimal", desc: "Barely noticeable" },
];

export default function ItemModal({ item, projects, defaultProjectId, onSave, onClose }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [projectId, setProjectId] = useState(item?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "");
  const [reach, setReach] = useState(item?.reach ?? 1000);
  const [impact, setImpact] = useState<number>(item?.impact ?? 1);
  const [confidence, setConfidence] = useState(item?.confidence ?? 80);
  const [effort, setEffort] = useState(item?.effort ?? 1);
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<RiceItem["status"]>(item?.status ?? "backlog");
  const [notes, setNotes] = useState(item?.notes ?? "");

  const score = calcScore(reach, impact, confidence, effort);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name,
      description,
      projectId,
      reach,
      impact,
      confidence,
      effort,
      score,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status,
      notes,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in">
        <div className="sticky top-0 glass border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">
            {item ? "Edit initiative" : "New initiative"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name + Project */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1.5">Initiative name *</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Onboarding redesign"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief context..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} style={{ background: "#12121a" }}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as RiceItem["status"])}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors"
              >
                <option value="backlog" style={{ background: "#12121a" }}>Backlog</option>
                <option value="in-progress" style={{ background: "#12121a" }}>In Progress</option>
                <option value="done" style={{ background: "#12121a" }}>Done</option>
                <option value="archived" style={{ background: "#12121a" }}>Archived</option>
              </select>
            </div>
          </div>

          {/* RICE Fields */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-300">RICE Score</h3>
              <ScoreGauge score={score} size="lg" />
            </div>

            {/* Reach */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                  Reach
                  <span className="text-xs text-zinc-600">(users per period)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={reach}
                  onChange={e => setReach(Number(e.target.value))}
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-right focus:outline-none focus:border-indigo-500/60"
                />
              </div>
              <input
                type="range"
                min={1}
                max={10000}
                value={reach}
                onChange={e => setReach(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>1</span><span>10,000</span>
              </div>
            </div>

            {/* Impact */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Impact</label>
              <div className="grid grid-cols-5 gap-2">
                {IMPACT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImpact(opt.value)}
                    title={opt.desc}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      impact === opt.value
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-indigo-500/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">Confidence</label>
                <span className="text-sm font-semibold text-indigo-400">{confidence}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={10}
                value={confidence}
                onChange={e => setConfidence(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>10% · Guess</span><span>100% · Certain</span>
              </div>
            </div>

            {/* Effort */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                  Effort
                  <span className="text-xs text-zinc-600">(person-months)</span>
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={effort}
                  onChange={e => setEffort(Number(e.target.value))}
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-right focus:outline-none focus:border-indigo-500/60"
                />
              </div>
              <input
                type="range"
                min={0.1}
                max={12}
                step={0.1}
                value={effort}
                onChange={e => setEffort(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>0.1</span><span>12 months</span>
              </div>
            </div>

            {/* Formula display */}
            <div className="bg-white/[0.03] rounded-xl p-3 text-xs text-zinc-500 font-mono">
              ({reach} × {impact} × {confidence}%) ÷ {effort} = <span className="text-indigo-400 font-semibold">{score}</span>
            </div>
          </div>

          {/* Tags + Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1.5">Tags <span className="text-zinc-600">(comma separated)</span></label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="growth, mobile, Q1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Assumptions, links, context..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              {item ? "Update" : "Add initiative"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
