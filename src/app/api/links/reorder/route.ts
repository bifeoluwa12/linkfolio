// src/app/api/links/reorder/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const MAX_LINKS = 20;

export async function PUT(req: Request) {
  try {
    const session = await requireSession();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { orderedIds } = body;

    // Validate shape
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array." }, { status: 400 });
    }
    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds cannot be empty." }, { status: 400 });
    }
    if (orderedIds.length > MAX_LINKS) {
      return NextResponse.json({ error: "Too many links in reorder request." }, { status: 400 });
    }
    // Every entry must be a non-empty string
    if (!orderedIds.every((id): id is string => typeof id === "string" && id.trim().length > 0)) {
      return NextResponse.json({ error: "All IDs must be non-empty strings." }, { status: 400 });
    }
    // No duplicates
    if (new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json({ error: "Duplicate IDs in reorder request." }, { status: 400 });
    }

    // Get profile for this user
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

    // Ownership check — all IDs must belong to this user's profile
    const ownedLinks = await prisma.link.findMany({
      where: { id: { in: orderedIds }, profileId: profile.id },
      select: { id: true },
    });

    if (ownedLinks.length !== orderedIds.length) {
      // One or more IDs don't belong to this tenant — reject the whole batch
      return NextResponse.json(
        { error: "One or more links do not belong to your profile." },
        { status: 403 }
      );
    }

    // Bulk update order in a single transaction — all or nothing
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.link.update({ where: { id }, data: { order: index } })
      )
    );

    return NextResponse.json({ data: { reordered: orderedIds.length } });

  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    console.error("[PUT /api/links/reorder]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}