
"use client";

import { signOut } from "next-auth/react";
import { Profile } from "@/types";
import { profileUrl } from "@/lib/utils";

interface Props {
  profile: Profile;
}

export function TopBar({ profile }: Props) {
  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-white/5 bg-[#0a0a0a] shrink-0">
      {/* Brand */}
      <div className="text-xs tracking-[0.3em] font-mono" style={{ color: profile.accent }}>
        ◆ LINKFOLIO
      </div>
      <span className="text-[10px] text-white/20 font-mono">STUDIO</span>

      <div className="flex-1" />

      {/* Live URL badge */}
      <a
        href={profileUrl(profile.username)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
      >
        linkfolio.app/<span style={{ color: profile.accent }}>{profile.username}</span> ↗
      </a>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 px-3 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-900/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        LIVE
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-[10px] text-white/30 hover:text-white/60 transition-colors font-mono"
      >
        Sign out
      </button>
    </header>
  );
}