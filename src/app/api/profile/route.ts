

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession();

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },   // ← tenant-scoped by userId
      include: {
        links: { orderBy: { order: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();

    // Whitelist fields — never let the client update userId or id directly
    const { name, role, bio, accent, avatar } = body;

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },   // ← tenant-scoped
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(bio !== undefined && { bio }),
        ...(accent !== undefined && { accent }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return NextResponse.json({ data: profile });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}