
"use client";

import { useState } from "react";
import { Link, LinkUpdatePayload, LinkType } from "@/types";

interface Props {
  link: Link;
  accent: string;
  isDragOver: boolean;
  dragProps: React.HTMLAttributes<HTMLDivElement> & { draggable: true };
  onUpdate: (payload: LinkUpdatePayload) => Promise<void>;
  onDelete: () => Promise<void>;
}

const TYPES: LinkType[] = ["primary", "secondary", "ghost"];

export function LinkRow({ link, accent, isDragOver, dragProps, onUpdate, onDelete }: Props) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onDelete();
  }

  return (
    <div
      {...dragProps}
      className="rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-grab active:cursor-grabbing select-none transition-all duration-150"
      style={{
        background: isDragOver ? "#1a1a1a" : "#0f0f0f",
        border: `1px solid ${isDragOver ? accent : "rgba(255,255,255,0.07)"}`,
        opacity: isDragOver ? 0.6 : deleting ? 0.4 : 1,
        transform: isDragOver ? "scale(0.98)" : "scale(1)",
      }}
    >
      {/* Drag handle */}
      <span className="text-white/20 text-sm shrink-0 select-none">⠿</span>

      {/* Label + URL */}
      <div className="flex-1 min-w-0">
        {editingLabel ? (
          <input
            autoFocus
            defaultValue={link.label}
            onBlur={(e) => { onUpdate({ label: e.target.value }); setEditingLabel(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="w-full bg-black border border-white/20 rounded-md px-2 py-0.5 text-xs outline-none"
            style={{ borderColor: accent }}
          />
        ) : (
          <div
            onClick={() => setEditingLabel(true)}
            className="text-xs text-white/80 truncate cursor-text hover:text-white transition-colors"
          >
            {link.label}
          </div>
        )}

        {editingUrl ? (
          <input
            autoFocus
            defaultValue={link.url}
            onBlur={(e) => { onUpdate({ url: e.target.value }); setEditingUrl(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="w-full bg-black border border-white/20 rounded-md px-2 py-0.5 text-[10px] outline-none mt-0.5 font-mono text-white/40"
            style={{ borderColor: accent }}
          />
        ) : (
          <div
            onClick={() => setEditingUrl(true)}
            className="text-[10px] text-white/25 truncate cursor-text hover:text-white/50 transition-colors font-mono mt-0.5"
          >
            {link.url}
          </div>
        )}

        <div className="text-[9px] text-white/20 mt-0.5">{link.clicks.toLocaleString()} clicks</div>
      </div>

      {/* Type selector */}
      <select
        value={link.type}
        onChange={(e) => onUpdate({ type: e.target.value as LinkType })}
        className="bg-black/60 border border-white/10 rounded-md text-[10px] px-1.5 py-1 text-white/40 cursor-pointer outline-none font-mono shrink-0"
      >
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0"
      >
        ✕
      </button>
    </div>
  );
}