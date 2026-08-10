// src/app/api/links/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

const VALID_TYPES = new Set(["primary", "secondary", "ghost"]);
const SAFE_URL_RE = /^https?:\/\/.{3,}/i;
const LABEL_MAX   = 80;
const URL_MAX     = 2000;

function validateUpdate(body: Record<string, unknown>): string | null {
  const { label, url, type } = body;

  if (label !== undefined) {
    if (typeof label !== "string" || !label.trim()) return "Label cannot be empty.";
    if (label.trim().length > LABEL_MAX) return `Label must be under ${LABEL_MAX} characters.`;
  }
  if (url !== undefined) {
    if (typeof url !== "string" || !url.trim()) return "URL cannot be empty.";
    if (url.length > URL_MAX) return "URL is too long.";
    if (!SAFE_URL_RE.test(url.trim())) return "URL must start with http:// or https://.";
  }
  if (type !== undefined && !VALID_TYPES.has(type as string)) {
    return "Link type must be primary, secondary, or ghost.";
  }
  return null;
}

// Ownership check — verifies link belongs to the authed user's profile
async function assertLinkOwnership(linkId: string, userId: string) {
  if (!linkId || typeof linkId !== "string") throw new Error("NOT_FOUND");

  const link = await prisma.link.findFirst({
    where: { id: linkId, profile: { userId } },
    select: { id: true },
  });
  if (!link) throw new Error("NOT_FOUND");
  return link;
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await assertLinkOwnership(id, session.user.id);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Validate before DB touch
    const validationError = validateUpdate(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { label, url, type, active } = body;

    const link = await prisma.link.update({
      where: { id },
      data: {
        ...(label  !== undefined && { label:  (label as string).trim() }),
        ...(url    !== undefined && { url:    (url as string).trim() }),
        ...(type   !== undefined && { type:   type as any }),
        ...(active !== undefined && typeof active === "boolean" && { active }),
      },
    });

    return NextResponse.json({ data: link });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (err.message === "NOT_FOUND")    return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await assertLinkOwnership(id, session.user.id);

    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (err.message === "NOT_FOUND")    return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}