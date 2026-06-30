
"use client";

import { useState } from "react";
import { LinkCreatePayload } from "@/types";

interface Props {
  onAdd: (payload: LinkCreatePayload) => Promise<void>;
  accent: string;
}

export function AddLinkButton({ onAdd, accent }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    await onAdd({ label: "✨ New Link", url: "https://", type: "secondary" });
    setLoading(false);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="text-[10px] font-mono px-3 py-1.5 rounded-lg text-white font-semibold transition-opacity disabled:opacity-50"
      style={{ background: accent }}
    >
      {loading ? "Adding…" : "+ Add Link"}
    </button>
  );
}