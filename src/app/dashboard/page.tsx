"use client";

import { useProfile } from "@/hooks/useProfile";
import { useLinks } from "@/hooks/useLinks";
import { TopBar } from "@/components/layout/TopBar";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { MobilePreview } from "@/components/preview/MobilePreview";
import { AnalyticsStrip } from "@/components/layout/AnalyticsStrip";

export default function DashboardPage() {
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { links, isLoading: linksLoading, addLink, updateLink, deleteLink, reorderLinks } = useLinks();

  if (profileLoading || linksLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm font-mono">
        Loading studio...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
        Failed to load profile. Please refresh.
      </div>
    );
  }

  return (
    <>
      {/* Top navigation bar with username + live badge */}
      <TopBar profile={profile} />

      {/* Split-screen — the main "flex" of the project */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: drag-and-drop editor */}
        <EditorPanel
          profile={profile}
          links={links}
          onUpdateProfile={updateProfile}
          onAddLink={addLink}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onReorderLinks={reorderLinks}
        />

        {/* RIGHT: live phone preview + analytics */}
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <MobilePreview profile={profile} links={links} />
          </div>
          <AnalyticsStrip links={links} accent={profile.accent} />
        </div>
      </div>
    </>
  );
}