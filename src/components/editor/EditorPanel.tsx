
"use client";

import { Profile, Link, ProfileUpdatePayload, LinkCreatePayload, LinkUpdatePayload } from "@/types";
import { ProfileFields } from "./ProfileFields";
import { LinkRow } from "./LinkRow";
import { AddLinkButton } from "./AddLinkButton";
import { useDragSort } from "@/hooks/useDragSort";

interface Props {
  profile: Profile;
  links: Link[];
  onUpdateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
  onAddLink: (payload: LinkCreatePayload) => Promise<void>;
  onUpdateLink: (id: string, payload: LinkUpdatePayload) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onReorderLinks: (reordered: Link[]) => Promise<void>;
}

export function EditorPanel({
  profile, links,
  onUpdateProfile, onAddLink, onUpdateLink, onDeleteLink, onReorderLinks,
}: Props) {
  const { getDragProps, dragOverIndex } = useDragSort(links, onReorderLinks);

  return (
    <div className="w-[52%] border-r border-white/5 flex flex-col overflow-hidden">
      {/* Editor header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: `linear-gradient(135deg, ${profile.accent}, ${profile.accent}66)` }}
        >
          {profile.avatar}
        </div>
        <div>
          <div className="text-xs font-semibold">{profile.name}</div>
          <div className="text-[9px] text-white/30 font-mono">ID: {profile.id.slice(0, 12)}… · TENANT ISOLATED</div>
        </div>
      </div>

      {/* Scrollable editor body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Profile section */}
        <section>
          <div className="text-[9px] font-mono text-white/30 tracking-widest mb-3 uppercase">
            Profile — User model
          </div>
          <ProfileFields profile={profile} onUpdate={onUpdateProfile} />
        </section>

        <div className="border-t border-white/5" />

        {/* Links section */}
        <section>
          <div className="flex items-center mb-3">
            <div className="text-[9px] font-mono text-white/30 tracking-widest uppercase flex-1">
              Links — Link model · {links.length} rows
            </div>
            <AddLinkButton onAdd={onAddLink} accent={profile.accent} />
          </div>

          <div className="flex flex-col gap-2">
            {links.map((link, i) => (
              <LinkRow
                key={link.id}
                link={link}
                accent={profile.accent}
                isDragOver={dragOverIndex === i}
                dragProps={getDragProps(i)}
                onUpdate={(payload) => onUpdateLink(link.id, payload)}
                onDelete={() => onDeleteLink(link.id)}
              />
            ))}

            {links.length === 0 && (
              <div className="text-center py-8 text-white/20 text-xs border border-dashed border-white/10 rounded-xl">
                No links yet — add one above
              </div>
            )}
          </div>
        </section>

        {/* Prisma schema callout */}
        <div className="rounded-xl border border-white/5 bg-white/2 p-4">
          <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase mb-3">
            Prisma Schema (simplified)
          </div>
          <pre className="text-[9px] text-white/30 font-mono leading-relaxed whitespace-pre">{`model Profile {
  userId  String  @unique   // one profile per user
  links   Link[]            // one-to-many
}

model Link {
  profileId String          // tenant FK
  order     Int             // drag-and-drop
  @@index([profileId, order])
}`}</pre>
        </div>
      </div>
    </div>
  );
}