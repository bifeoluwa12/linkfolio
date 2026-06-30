

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// ── Helper: get the authed user's profileId ───────────────────────────────────
async function getProfileId(userId: string): Promise<string | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export async function GET() {
  try {
    const session = await requireSession();
    const profileId = await getProfileId(session.user.id);
    if (!profileId) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

    const links = await prisma.link.findMany({
      where: { profileId },           // ← tenant-isolated
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: links });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const profileId = await getProfileId(session.user.id);
    if (!profileId) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

    const { label, url, type } = await req.json();
    if (!label || !url) return NextResponse.json({ error: "label and url are required." }, { status: 400 });

    // Set the new link's order to the end of the list
    const maxOrder = await prisma.link.aggregate({
      where: { profileId },
      _max: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        label,
        url,
        type: type ?? "secondary",
        order: (maxOrder._max.order ?? -1) + 1,
        profileId,                    // ← always set to the authed user's profile
      },
    });

    return NextResponse.json({ data: link }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}