"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { slugify } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/30 text-sm font-mono">
        Loading settings...
      </div>
    );
  }

  if (!profile) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    await updateProfile({
      name: data.get("name") as string,
      role: data.get("role") as string,
      bio: data.get("bio") as string,
      accent: data.get("accent") as string,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors font-sans";

  return (
    <div className="min-h-screen bg-[#070707] px-6 py-12 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">
          ◆ Linkfolio Studio
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/30 text-sm mt-1">
          Manage your profile details and preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile section */}
        <section className="flex flex-col gap-4">
          <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase">
            Profile
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Display Name</label>
            <input
              name="name"
              defaultValue={profile.name}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Username</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <span className="pl-4 text-white/20 text-sm">linkfolio.app/</span>
              <input
                defaultValue={profile.username}
                disabled
                className="flex-1 bg-transparent px-2 py-3 text-sm outline-none text-white/30 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-white/20 mt-1 font-mono">
              Username cannot be changed after registration.
            </p>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Role / Tagline</label>
            <input
              name="role"
              defaultValue={profile.role}
              placeholder="e.g. Real Estate Agent · Miami, FL"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile.bio}
              rows={3}
              placeholder="Tell visitors who you are..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Accent Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="accent"
                defaultValue={profile.accent}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono text-white/30">{profile.accent}</span>
            </div>
          </div>
        </section>

        <div className="border-t border-white/5" />

        {/* Public URL */}
        <section className="flex flex-col gap-3">
          <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase">
            Public Profile
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
            <div>
              <div className="text-xs text-white/60">Your public link</div>
              <div className="text-sm font-mono mt-0.5" style={{ color: profile.accent }}>
                linkfolio.app/{profile.username}
              </div>
            </div>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
            >
              View ↗
            </a>
          </div>
        </section>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: profile.accent }}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}