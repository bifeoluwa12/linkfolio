// src/app/api/profile/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// ── Field validators ─────────────────────────────────────────────────────────
const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const URL_RE = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?$/;

const LIMITS = {
  name:     { min: 2,  max: 60  },
  role:     { min: 0,  max: 80  },
  bio:      { min: 0,  max: 300 },
  tagline:  { min: 0,  max: 60  },
  location: { min: 0,  max: 60  },
  website:  { min: 0,  max: 200 },
};

function validateProfileFields(data: Record<string, unknown>): string | null {
  const { name, role, bio, tagline, location, website, accent } = data;

  if (name !== undefined) {
    if (typeof name !== "string") return "Name must be a string.";
    if (name.trim().length < LIMITS.name.min) return "Name is too short.";
    if (name.trim().length > LIMITS.name.max) return `Name must be under ${LIMITS.name.max} characters.`;
  }
  if (role !== undefined) {
    if (typeof role !== "string") return "Role must be a string.";
    if (role.length > LIMITS.role.max) return `Role must be under ${LIMITS.role.max} characters.`;
  }
  if (bio !== undefined) {
    if (typeof bio !== "string") return "Bio must be a string.";
    if (bio.length > LIMITS.bio.max) return `Bio must be under ${LIMITS.bio.max} characters.`;
  }
  if (tagline !== undefined) {
    if (typeof tagline !== "string") return "Tagline must be a string.";
    if (tagline.length > LIMITS.tagline.max) return `Tagline must be under ${LIMITS.tagline.max} characters.`;
  }
  if (location !== undefined) {
    if (typeof location !== "string") return "Location must be a string.";
    if (location.length > LIMITS.location.max) return `Location must be under ${LIMITS.location.max} characters.`;
  }
  if (website !== undefined && website !== "") {
    if (typeof website !== "string") return "Website must be a string.";
    if (website.length > LIMITS.website.max) return `Website URL is too long.`;
    if (!URL_RE.test(website)) return "Website must be a valid URL starting with http:// or https://.";
  }
  if (accent !== undefined) {
    if (typeof accent !== "string") return "Accent must be a string.";
    if (!HEX_COLOR_RE.test(accent)) return "Accent must be a valid hex color (e.g. #E11D48).";
  }
  return null;
}

export async function GET() {
  try {
    const session = await requireSession();

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { links: { orderBy: { order: "asc" } } },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ data: profile });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Validate all fields before touching the DB
    const validationError = validateProfileFields(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    // Whitelist — only these fields can be updated, nothing else
    const { name, role, bio, accent, avatar, tagline, location, website } = body;

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(name     !== undefined && { name:     (name as string).trim() }),
        ...(role     !== undefined && { role:     (role as string).trim() }),
        ...(bio      !== undefined && { bio:      (bio as string).trim() }),
        ...(accent   !== undefined && { accent:   accent as string }),
        ...(avatar   !== undefined && { avatar:   (avatar as string).trim() }),
        ...(tagline  !== undefined && { tagline:  (tagline as string).trim() }),
        ...(location !== undefined && { location: (location as string).trim() }),
        ...(website  !== undefined && { website:  (website as string).trim() }),
      },
    });

    return NextResponse.json({ data: profile });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}