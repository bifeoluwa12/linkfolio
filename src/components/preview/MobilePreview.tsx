

import { Profile, Link } from "@/types";
import { PublicProfile } from "./PublicProfile";

interface Props {
  profile: Profile;
  links: Link[];
}

export function MobilePreview({ profile, links }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#070707] relative overflow-hidden">
      {/* Ambient glow behind phone */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${profile.accent}30 0%, transparent 70%)`,
          top: "10%", left: "50%", transform: "translateX(-50%)",
          filter: "blur(50px)",
        }}
      />

      {/* Header label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/20 tracking-widest uppercase">
        Live Preview
      </div>

      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 240, height: 480,
          background: "#0c0c0c",
          borderRadius: 36,
          border: "2px solid #1e1e1e",
          boxShadow: `0 0 60px ${profile.accent}25, 0 40px 80px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Notch */}
        <div className="w-20 h-5 bg-black rounded-b-xl mx-auto shrink-0" />

        {/* Scrollable profile content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <PublicProfile profile={profile} links={links} compact />
        </div>
      </div>
    </div>
  );
}