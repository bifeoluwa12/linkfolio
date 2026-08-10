// src/app/api/links/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// ── Validators ───────────────────────────────────────────────────────────────
const VALID_TYPES  = new Set(["primary", "secondary", "ghost"]);
const MAX_LINKS    = 20; // hard cap per tenant
const LABEL_MAX    = 80;
const URL_MAX      = 2000;

// Block javascript:, data:, vbscript: and other dangerous schemes
const SAFE_URL_RE = /^https?:\/\/.{3,}/i;

function validateLink(label: unknown, url: unknown, type: unknown): string | null {
  if (!label || typeof label !== "string" || !label.trim())
    return "Link label is required.";
  if (label.trim().length > LABEL_MAX)
    return `Label must be under ${LABEL_MAX} characters.`;

  if (!url || typeof url !== "string" || !url.trim())
    return "Link URL is required.";
  if (url.length > URL_MAX)
    return "URL is too long.";
  if (!SAFE_URL_RE.test(url.trim()))
    return "URL must start with http:// or https://.";

  if (type !== undefined && !VALID_TYPES.has(type as string))
    return "Link type must be primary, secondary, or ghost.";

  return null;
}

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
      where: { profileId },
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

    // Parse body safely
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { label, url, type = "secondary" } = body;

    // Validate before DB touch
    const validationError = validateLink(label, url, type);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    // Enforce per-tenant max links cap
    const linkCount = await prisma.link.count({ where: { profileId } });
    if (linkCount >= MAX_LINKS) {
      return NextResponse.json(
        { error: `You can have a maximum of ${MAX_LINKS} links.` },
        { status: 422 }
      );
    }

    // Set new link order to end of list
    const maxOrder = await prisma.link.aggregate({
      where: { profileId },
      _max: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        label:     (label as string).trim(),
        url:       (url as string).trim(),
        type:      type as any,
        order:     (maxOrder._max.order ?? -1) + 1,
        profileId,
      },
    });

    return NextResponse.json({ data: link }, { status: 201 });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}