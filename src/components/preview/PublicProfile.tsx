

import { Profile, Link } from "@/types";

interface Props {
  profile: Pick<Profile, "username" | "name" | "role" | "bio" | "accent" | "avatar">;
  links: Link[];
  compact?: boolean;
}

export function PublicProfile({ profile, links, compact = false }: Props) {
  const s = compact
    ? { avatar: 56, avatarText: 18, name: 12, role: 9, bio: 9, url: 9, link: 10, gap: 6, pad: "10px 14px 20px" }
    : { avatar: 96, avatarText: 32, name: 24, role: 14, bio: 14, url: 12, link: 15, gap: 12, pad: "24px 24px 40px" };

  return (
    <div style={{ padding: s.pad, display: "flex", flexDirection: "column" }}>
      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: compact ? 10 : 20 }}>
        <div style={{
          width: s.avatar, height: s.avatar, borderRadius: "50%",
          background: `linear-gradient(135deg, ${profile.accent}, ${profile.accent}66)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: s.avatarText, fontWeight: 700, color: "#fff",
          margin: "0 auto 8px",
          border: `2px solid ${profile.accent}55`,
          boxShadow: `0 0 20px ${profile.accent}30`,
        }}>
          {profile.avatar}
        </div>

        <div style={{ color: "#fff", fontSize: s.name, fontWeight: 700, letterSpacing: "-0.3px" }}>
          {profile.name}
        </div>
        <div style={{ color: "#888", fontSize: s.role, marginTop: 3 }}>
          {profile.role}
        </div>
        <div style={{ color: "#aaa", fontSize: s.bio, marginTop: 8, lineHeight: 1.5, padding: "0 8px" }}>
          {profile.bio}
        </div>
      </div>

      {/* URL pill */}
      <div style={{
        background: "#111", borderRadius: 8, padding: compact ? "4px 10px" : "6px 16px",
        fontSize: s.url, color: "#555", marginBottom: compact ? 10 : 20,
        textAlign: "center", border: "1px solid #1e1e1e",
      }}>
        linkfolio.app/<span style={{ color: profile.accent }}>{profile.username}</span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: s.gap }}>
        {links.filter((l) => l.active).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              borderRadius: compact ? 8 : 14,
              padding: compact ? "8px 12px" : "14px 20px",
              fontSize: s.link,
              fontWeight: 600,
              textAlign: "center",
              display: "block",
              textDecoration: "none",
              transition: "opacity 0.15s, transform 0.15s",
              cursor: "pointer",
              ...(link.type === "primary" ? {
                background: profile.accent,
                color: "#fff",
                boxShadow: `0 4px 16px ${profile.accent}44`,
              } : link.type === "secondary" ? {
                background: "#1a1a1a",
                color: "#ddd",
                border: `1px solid ${profile.accent}33`,
              } : {
                background: "transparent",
                color: "#555",
                border: "1px solid #222",
              }),
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {!compact && (
        <div style={{ textAlign: "center", marginTop: 32, color: "#2a2a2a", fontSize: 11, fontFamily: "monospace" }}>
          ◆ LINKFOLIO
        </div>
      )}
    </div>
  );
}