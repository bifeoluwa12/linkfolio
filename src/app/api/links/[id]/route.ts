

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

interface Props {
  params: { id: string };
}

// ── Ownership guard ───────────────────────────────────────────────────────────
// Ensures the link belongs to the authed user's profile before any mutation.
// This is the critical multi-tenant security check — without it, any user
// could edit or delete another tenant's links by guessing IDs.
async function assertLinkOwnership(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      profile: { userId },            // ← join through to userId for ownership
    },
    select: { id: true },
  });

  if (!link) throw new Error("NOT_FOUND");
  return link;
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await requireSession();
    await assertLinkOwnership(params.id, session.user.id);

    const { label, url, type, active } = await req.json();

    const link = await prisma.link.update({
      where: { id: params.id },
      data: {
        ...(label !== undefined && { label }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ data: link });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const session = await requireSession();
    await assertLinkOwnership(params.id, session.user.id);

    await prisma.link.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}