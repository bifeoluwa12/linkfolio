import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, LinkType } = require("@prisma/client");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Tenant 1: Real Estate Agent ───────────────────────────────────────────
  const alexUser = await prisma.user.upsert({
    where: { email: "alex@linkfolio.app" },
    update: {},
    create: {
      email: "alex@linkfolio.app",
      name: "Alex Morgan",
      password: await bcrypt.hash("password123", 12),
      profile: {
        create: {
          username: "alex-morgan",
          name: "Alex Morgan",
          role: "Real Estate Agent · Miami, FL",
          bio: "Helping families find their forever home. DRE #01234567",
          accent: "#FF6B35",
          avatar: "AM",
          links: {
            create: [
              { label: "📍 Browse My Listings",  url: "https://example.com", type: LinkType.primary,   order: 0, clicks: 842 },
              { label: "📅 Schedule a Showing",  url: "https://example.com", type: LinkType.secondary, order: 1, clicks: 391 },
              { label: "💬 Client Testimonials", url: "https://example.com", type: LinkType.secondary, order: 2, clicks: 210 },
              { label: "📊 Market Reports",      url: "https://example.com", type: LinkType.ghost,     order: 3, clicks: 178 },
              { label: "🏠 Zillow Profile",      url: "https://example.com", type: LinkType.ghost,     order: 4, clicks: 134 },
            ],
          },
        },
      },
    },
  });

  // ── Tenant 2: SaaS Founder ────────────────────────────────────────────────
  const priyaUser = await prisma.user.upsert({
    where: { email: "priya@linkfolio.app" },
    update: {},
    create: {
      email: "priya@linkfolio.app",
      name: "Priya Sharma",
      password: await bcrypt.hash("password123", 12),
      profile: {
        create: {
          username: "priya-dev",
          name: "Priya Sharma",
          role: "SaaS Founder · YC W24",
          bio: "Building the future of async work. Shipped 3 products, exited 1.",
          accent: "#7C3AED",
          avatar: "PS",
          links: {
            create: [
              { label: "🚀 Try FlowSync Free",  url: "https://example.com", type: LinkType.primary,   order: 0, clicks: 2341 },
              { label: "📝 Read My Build Log",  url: "https://example.com", type: LinkType.secondary, order: 1, clicks: 987  },
              { label: "🎙️ Founder Podcast",    url: "https://example.com", type: LinkType.secondary, order: 2, clicks: 654  },
              { label: "𝕏 Follow for Updates", url: "https://example.com", type: LinkType.ghost,     order: 3, clicks: 421  },
            ],
          },
        },
      },
    },
  });

  const jamesUser = await prisma.user.upsert({
  where: { email: "james@linkfolio.app" },
  update: {},
  create: {
    email: "james@linkfolio.app",
    name: "James wu",
    password: await bcrypt.hash("password123", 12),
    profile: {
      create: {
        username: "james-wu",
        name: "James wu",
        role: "Brand Photographer · NYC",
        bio: "Editorial and commercial photography for brands that refuse to be boring.",
        accent: "#FB7185",
        avatar: "JW",
        niche: "photographer",
        tagline: "Booked 3 months in advance",
        links: {
          create: [
            { label: "📸 View My Portfolio",       url: "https://example.com", type: "primary",   order: 0, clicks: 521 },
            { label: "📅 Check Availability",      url: "https://example.com", type: "secondary", order: 1, clicks: 298 },
            { label: "💰 See Packages & Pricing",  url: "https://example.com", type: "secondary", order: 2, clicks: 187 },
            { label: "✉️ Let's Work Together",     url: "https://example.com", type: "ghost",     order: 3, clicks: 143 },
          ],
        },
      },
    },
  },
});

  console.log("✅ Seeded:", alexUser.email, priyaUser.email, jamesUser.email);
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
