
"use client";

import { useRef } from "react";
import { Profile, ProfileUpdatePayload } from "@/types";

interface Props {
  profile: Profile;
  onUpdate: (payload: ProfileUpdatePayload) => Promise<void>;
}

const FIELDS: { label: string; key: keyof ProfileUpdatePayload; multiline?: boolean }[] = [
  { label: "Display Name", key: "name" },
  { label: "Role / Tagline", key: "role" },
  { label: "Bio", key: "bio", multiline: true },
];

export function ProfileFields({ profile, onUpdate }: Props) {
  // Debounce ref — fire update 600ms after user stops typing
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function handleChange(key: keyof ProfileUpdatePayload, value: string) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      onUpdate({ [key]: value });
    }, 600);
  }

  const inputBase =
    "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none transition-colors font-sans placeholder:text-white/20";

  return (
    <div className="flex flex-col gap-3">
      {FIELDS.map(({ label, key, multiline }) => (
        <div key={key}>
          <label className="text-[9px] text-white/30 font-mono block mb-1 uppercase tracking-wider">
            {label}
          </label>
          {multiline ? (
            <textarea
              defaultValue={profile[key] as string}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={2}
              className={`${inputBase} resize-none`}
              style={{ "--tw-ring-color": profile.accent } as any}
              onFocus={(e) => (e.target.style.borderColor = profile.accent)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          ) : (
            <input
              defaultValue={profile[key] as string}
              onChange={(e) => handleChange(key, e.target.value)}
              className={inputBase}
              onFocus={(e) => (e.target.style.borderColor = profile.accent)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          )}
        </div>
      ))}

      {/* Color picker */}
      <div>
        <label className="text-[9px] text-white/30 font-mono block mb-1 uppercase tracking-wider">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            defaultValue={profile.accent}
            onChange={(e) => handleChange("accent", e.target.value)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5"
          />
          <span className="text-[10px] font-mono text-white/30">{profile.accent}</span>
        </div>
      </div>
    </div>
  );
}