import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { PublicProfile } from "@/components/preview/PublicProfile";

interface Props {
  params: { username: string };
}

// ── Static metadata per tenant ────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;  // ← must await
  const profile = await getProfile(username);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.name} — Linkfolio`,
    description: profile.bio,
  };
}

// ── Data fetching — scoped entirely to this username (tenant-isolated) ────────
async function getProfile(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      links: true,
    },
  });

  if (!profile) return null;

  // Filter and sort in JS instead of DB to avoid Prisma 7 query compiler panic
  profile.links = profile.links
    .filter((l: { active: boolean }) => l.active)
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order);

  return profile;
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;  // ← must await
  const profile = await getProfile(username);
  if (!profile) notFound();

  return (
    <main className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
      <PublicProfile profile={profile} links={profile.links} />
    </main>
  );
}

// Optional: pre-generate pages for existing usernames at build time
export async function generateStaticParams() {
  try {
    const profiles = await prisma.profile.findMany({
      select: { username: true },
    });
    return profiles.map((p: { username: string }) => ({
      username: p.username,
    }));
  } catch {
    // Tables may not exist yet during build — return empty, pages render on demand
    return [];
  }
}