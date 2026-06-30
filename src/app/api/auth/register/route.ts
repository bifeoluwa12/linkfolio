// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { slugify, getInitials } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, username, niche, tagline } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { error: "Name, email, password and username are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const cleanUsername = slugify(username);

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    // ── Uniqueness checks (parallel) ──────────────────────────────────────────
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } }),
      prisma.profile.findUnique({ where: { username: cleanUsername }, select: { id: true } }),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken. Try another." }, { status: 409 });
    }

    // ── Create User + Profile in one transaction ──────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashed,
        plan: "free",
        profile: {
          create: {
            username: cleanUsername,
            name,
            avatar: getInitials(name),
            accent: "#E11D48",
            niche: niche ?? "other",
            tagline: tagline ?? "",
            theme: "dark",
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        profile: { select: { username: true } },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: user.id,
          email: user.email,
          username: user.profile?.username,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}