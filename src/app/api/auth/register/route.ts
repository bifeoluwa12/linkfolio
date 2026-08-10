// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { slugify, getInitials } from "@/lib/utils";

// ── Bulletproof regex validators ─────────────────────────────────────────────
const EMAIL_RE   = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const USERNAME_RE = /^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/; // 3–30 chars, no leading/trailing hyphen
const NAME_RE    = /^[\p{L}\p{M}\s'\-\.]{2,60}$/u;         // Unicode names, 2–60 chars

// Reserved usernames that would collide with app routes
const RESERVED = new Set([
  "admin","api","dashboard","login","register","logout","settings",
  "profile","help","support","about","terms","privacy","app","www",
  "mail","blog","docs","status","cdn","static","assets","linkfolio",
]);

// Valid niche values — must match Prisma enum exactly
const VALID_NICHES = new Set([
  "real_estate","saas_founder","photographer","coach","consultant",
  "musician","lawyer","freelancer","fitness","therapist","other",
]);

export async function POST(req: Request) {
  try {
    // ── Parse body safely ─────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name     = typeof body.name     === "string" ? body.name.trim()     : "";
    const email    = typeof body.email    === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password         : "";
    const username = typeof body.username === "string" ? slugify(body.username) : "";
    const niche    = typeof body.niche    === "string" ? body.niche             : "other";
    const tagline  = typeof body.tagline  === "string" ? body.tagline.trim().slice(0, 60) : "";

    // ── Field-level validation ────────────────────────────────────────────────
    if (!name)  return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!NAME_RE.test(name)) return NextResponse.json({ error: "Name contains invalid characters." }, { status: 400 });

    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    if (!password) return NextResponse.json({ error: "Password is required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (password.length > 128) return NextResponse.json({ error: "Password is too long." }, { status: 400 });

    if (!username) return NextResponse.json({ error: "Username is required." }, { status: 400 });
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json({
        error: "Username must be 3–30 characters, lowercase letters, numbers, and hyphens only.",
      }, { status: 400 });
    }
    if (RESERVED.has(username)) {
      return NextResponse.json({ error: "That username is reserved. Please choose another." }, { status: 400 });
    }

    // Sanitize niche — silently fall back to "other" if invalid value sent
    const safeNiche = VALID_NICHES.has(niche) ? niche : "other";

    // ── Uniqueness checks (parallel — one round trip) ─────────────────────────
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.profile.findUnique({ where: { username }, select: { id: true } }),
    ]);

    if (existingEmail)    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    if (existingUsername) return NextResponse.json({ error: "Username already taken. Try another." }, { status: 409 });

    // ── Create User + Profile atomically ─────────────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        plan: "free",
        profile: {
          create: {
            username,
            name,
            avatar:  getInitials(name),
            accent:  "#E11D48",
            niche:   safeNiche as any,
            tagline,
            theme:   "dark",
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
      { data: { id: user.id, email: user.email, username: user.profile?.username } },
      { status: 201 }
    );

  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}