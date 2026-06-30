
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    const { orderedIds }: { orderedIds: string[] } = await req.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds must be a non-empty array." }, { status: 400 });
    }

    // Verify all links belong to this user (ownership check before mutation)
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

    const ownedLinks = await prisma.link.findMany({
      where: { id: { in: orderedIds }, profileId: profile.id },
      select: { id: true },
    });

    if (ownedLinks.length !== orderedIds.length) {
      // At least one ID doesn't belong to this user — reject the entire batch
      return NextResponse.json({ error: "Unauthorized link in reorder request." }, { status: 403 });
    }

    // Bulk update `order` in a single transaction
    // Each link gets its new position index as its `order` value
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.link.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ data: { reordered: orderedIds.length } });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    console.error("[PUT /api/links/reorder]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}