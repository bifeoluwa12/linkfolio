

import { Link } from "@/types";
import { formatClicks } from "@/lib/utils";

interface Props {
  links: Link[];
  accent: string;
}

export function AnalyticsStrip({ links, accent }: Props) {
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const topLink = [...links].sort((a, b) => b.clicks - a.clicks)[0];

  const stats = [
    { label: "Total Clicks", value: formatClicks(totalClicks) },
    { label: "Links Live",   value: String(links.filter((l) => l.active).length) },
    { label: "Top Link",     value: topLink?.label.slice(0, 20) ?? "—" },
  ];

  return (
    <div className="border-t border-white/5 px-6 py-3 flex gap-8 shrink-0">
      {stats.map(({ label, value }) => (
        <div key={label}>
          <div className="text-[8px] font-mono text-white/30 tracking-widest uppercase">{label}</div>
          <div className="text-sm font-bold mt-0.5 font-mono" style={{ color: accent }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}