"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PROFILES = [
  {
    name: "Alex Morgan",
    role: "Real Estate Agent · Miami, FL",
    handle: "alex-morgan",
    color: "#FF6B35",
    avatar: "AM",
    niche: "Real Estate",
    tagline: "Closed $4.2M last quarter",
    bio: "Helping families find their forever home in South Florida.",
    links: [
      { label: "📍 Browse Active Listings", type: "primary" },
      { label: "📅 Book a Free Consultation", type: "secondary" },
      { label: "💬 Read Client Stories", type: "secondary" },
      { label: "📊 2024 Market Report", type: "ghost" },
    ],
  },
  {
    name: "Priya Sharma",
    role: "SaaS Founder · YC W24",
    handle: "priya-dev",
    color: "#E11D48",
    avatar: "PS",
    niche: "SaaS Founders",
    tagline: "3 products shipped, 1 exit",
    bio: "Building async-first tools for distributed teams.",
    links: [
      { label: "🚀 Try FlowSync — Free Forever", type: "primary" },
      { label: "📝 Follow My Build in Public", type: "secondary" },
      { label: "🎙️ The Founder Files Podcast", type: "secondary" },
      { label: "𝕏 15k Followers & Growing", type: "ghost" },
    ],
  },
  {
    name: "James Wu",
    role: "Brand Photographer · NYC",
    handle: "james-wu",
    color: "#FB7185",
    avatar: "JW",
    niche: "Creatives",
    tagline: "Booked 3 months in advance",
    bio: "Editorial and commercial photography for brands that refuse to be boring.",
    links: [
      { label: "📸 View My Portfolio", type: "primary" },
      { label: "📅 Check Availability", type: "secondary" },
      { label: "💰 See Packages & Pricing", type: "secondary" },
      { label: "✉️ Let's Work Together", type: "ghost" },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: "I replaced my entire Linktree, website bio, and booking page with one Linkfolio link. My clients tell me it feels premium.",
    name: "Sarah K.",
    role: "Real Estate Agent, Austin TX",
    result: "+340% more showings booked",
    color: "#FF6B35",
  },
  {
    quote: "Built my profile in 8 minutes. It went in my Twitter bio and drove 2,000 trial signups in the first month. No joke.",
    name: "Marcus T.",
    role: "Indie Hacker & SaaS Founder",
    result: "2,000 trial signups in 30 days",
    color: "#E11D48",
  },
  {
    quote: "My old link-in-bio looked like a grocery list. Linkfolio made it look like a gallery. Inquiries went up immediately.",
    name: "Yemi A.",
    role: "Brand Photographer, London",
    result: "Fully booked within 2 weeks",
    color: "#FB7185",
  },
];

const STEPS = [
  { n: "01", title: "Claim your URL", body: "linkfolio.app/yourname is yours in 60 seconds. No design skills. No credit card. Just your name." },
  { n: "02", title: "Add your links", body: "Drop in your most important links — listings, bookings, portfolio, socials. Drag to reorder anytime." },
  { n: "03", title: "Pick your look", body: "Choose an accent color that matches your brand. Watch the live preview update in real time on the right." },
  { n: "04", title: "Drop it everywhere", body: "One link in your Instagram bio, email signature, and business card. Your whole world, one tap away." },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverCta, setHoverCta] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const profile = PROFILES[activeProfile];

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveProfile((p) => (p + 1) % PROFILES.length);
    }, 3500);
  }, []);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  function switchProfile(i: number) {
    setActiveProfile(i);
    startAuto();
  }

  function viewDemo() {
    router.push(`/${profile.handle}`);
  }

  const testimonial = TESTIMONIALS[activeTestimonial];

  return (
    <main style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#080004",
      minHeight: "100vh",
      color: "#fff",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(225,29,72,0.3); border-radius: 2px; }
      `}</style>

      {/* Cursor glow */}
      <div style={{
        position: "fixed", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(225,29,72,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
        transform: `translate(${mousePos.x - 250}px, ${mousePos.y - 250}px)`,
        transition: "transform 0.15s ease",
      }} />

      {/* BG orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 60%)", top: "-15%", right: "-10%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,113,133,0.06) 0%, transparent 60%)", bottom: "5%", left: "-8%", filter: "blur(100px)" }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center",
        padding: "18px 48px",
        borderBottom: "1px solid rgba(225,29,72,0.1)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{
          fontSize: 13, letterSpacing: "0.3em", fontFamily: "monospace", fontWeight: 700,
          background: "linear-gradient(135deg, #FF6B35, #E11D48, #FB7185)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>◆ LINKFOLIO</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "How it works", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} style={{
              fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer",
              letterSpacing: "0.08em", fontFamily: "monospace", textDecoration: "none",
            }}>{item}</a>
          ))}
          <Link href="/login" style={{
            fontSize: 12, color: "rgba(255,255,255,0.5)",
            textDecoration: "none", fontFamily: "monospace", letterSpacing: "0.05em",
          }}>Sign in</Link>
          <Link href="/register" style={{
            fontSize: 12, padding: "9px 22px", borderRadius: 4,
            background: "linear-gradient(135deg, #C41230, #E11D48)",
            color: "#fff", textDecoration: "none",
            fontFamily: "monospace", letterSpacing: "0.05em",
            boxShadow: "0 0 24px rgba(225,29,72,0.35)",
          }}>Get started free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", zIndex: 5,
        padding: "72px 48px 56px",
        display: "grid", gridTemplateColumns: "1fr 480px",
        gap: 64, alignItems: "center",
        maxWidth: 1240, margin: "0 auto",
      }}>
        {/* LEFT */}
        <div style={{ animation: "fadeUp 0.7s ease both" }}>
          {/* Pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px 5px 8px", borderRadius: 20,
            border: "1px solid rgba(225,29,72,0.3)",
            background: "rgba(225,29,72,0.06)", marginBottom: 32,
          }}>
            <span style={{
              background: "#E11D48", color: "#fff", fontSize: 9,
              padding: "3px 8px", borderRadius: 12, fontFamily: "monospace",
              letterSpacing: "0.1em", fontWeight: 700,
            }}>10K+</span>
            <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              ISOLATED PROFILES — EACH ONE FULLY YOURS
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 66, lineHeight: 1.02, fontWeight: 400, margin: "0 0 28px", letterSpacing: "-2.5px" }}>
            Not a template.
            <br />
            Not a{" "}
            <span style={{
              position: "relative", display: "inline-block",
              textDecoration: "line-through", color: "rgba(255,255,255,0.2)",
              textDecorationColor: "rgba(225,29,72,0.6)",
            }}>
              shared
            </span>
            {" "}space.
            <br />
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #FF6B35 0%, #E11D48 50%, #FB7185 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Your own profile,
            </span>
            <br />
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #FF6B35 0%, #E11D48 50%, #FB7185 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              fully yours.
            </span>
          </h1>

          <p style={{
            fontSize: 17, lineHeight: 1.8,
            color: "rgba(255,255,255,0.45)", maxWidth: 460,
            margin: "0 0 44px", fontFamily: "monospace",
          }}>
            Every Linkfolio profile lives in its own isolated space — your links, your branding,
            your data, completely separate from every other user on the platform. One powerful
            engine, thousands of private rooms.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href="/register"
              onMouseEnter={() => setHoverCta(true)}
              onMouseLeave={() => setHoverCta(false)}
              style={{
                padding: "15px 36px", borderRadius: 4,
                background: hoverCta
                  ? "linear-gradient(135deg, #E11D48, #FF6B35)"
                  : "linear-gradient(135deg, #C41230, #E11D48)",
                color: "#fff", textDecoration: "none", fontSize: 14,
                fontFamily: "monospace", letterSpacing: "0.06em",
                boxShadow: hoverCta
                  ? "0 0 60px rgba(225,29,72,0.6), 0 8px 30px rgba(0,0,0,0.4)"
                  : "0 0 40px rgba(225,29,72,0.35), 0 4px 20px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease", display: "inline-block",
              }}
            >
              Build my free profile →
            </Link>
            <button
              onClick={viewDemo}
              style={{
                padding: "15px 28px", borderRadius: 4,
                border: `1px solid ${profile.color}44`,
                background: `${profile.color}08`,
                color: "rgba(255,255,255,0.6)", fontSize: 13,
                fontFamily: "monospace", letterSpacing: "0.05em",
                cursor: "pointer", transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = profile.color;
                (e.target as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = `${profile.color}44`;
                (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
              }}
            >
              View {profile.name.split(" ")[0]}'s profile ↗
            </button>
          </div>

          {/* Trust bar */}
          <div style={{
            marginTop: 48, paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 0, alignItems: "stretch",
          }}>
            {[
              { n: "10,000+", l: "isolated tenants" },
              { n: "Zero", l: "cross-account leaks" },
              { n: "< 60s", l: "to claim your space" },
            ].map(({ n, l }, i) => (
              <div key={l} style={{
                flex: 1, paddingRight: 24,
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                paddingLeft: i > 0 ? 24 : 0,
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 700,
                  background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.5))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}>{n}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginTop: 3, letterSpacing: "0.1em" }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Phone */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {/* Niche tabs */}
          <div style={{
            display: "flex", gap: 6, padding: "4px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {PROFILES.map((p, i) => (
              <button
                key={p.niche}
                onClick={() => switchProfile(i)}
                style={{
                  padding: "7px 16px", borderRadius: 7, fontSize: 11,
                  fontFamily: "monospace", letterSpacing: "0.08em",
                  border: "none", cursor: "pointer", transition: "all 0.25s ease",
                  background: activeProfile === i ? p.color : "transparent",
                  color: activeProfile === i ? "#fff" : "rgba(255,255,255,0.3)",
                  boxShadow: activeProfile === i ? `0 0 16px ${p.color}50` : "none",
                }}
              >
                {p.niche}
              </button>
            ))}
          </div>

          {/* Phone frame */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", width: 320, height: 320, borderRadius: "50%",
              background: `radial-gradient(circle, ${profile.color}25 0%, transparent 65%)`,
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              filter: "blur(50px)", transition: "background 0.5s ease",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 270, height: 540, background: "#0c0008",
              borderRadius: 44, position: "relative", zIndex: 2,
              border: `1.5px solid ${profile.color}30`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 0 80px ${profile.color}20, 0 50px 100px rgba(0,0,0,0.8)`,
              overflow: "hidden", display: "flex", flexDirection: "column",
              transition: "border-color 0.5s ease, box-shadow 0.5s ease",
            }}>
              {/* Status bar */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px 4px", flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>9:41</span>
                <div style={{ width: 80, height: 20, background: "#000", borderRadius: 10 }} />
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[3,2,3].map((h,i) => <div key={i} style={{ width: 3, height: h+3, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />)}
                </div>
              </div>

              {/* URL bar */}
              <div style={{
                margin: "8px 16px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8, padding: "6px 12px",
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
                  linkfolio.app/<span style={{ color: profile.color }}>{profile.handle}</span>
                </span>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 18px 24px", scrollbarWidth: "none" }}>
                {/* Avatar */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${profile.color}dd, ${profile.color}55)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, fontWeight: 700, color: "#fff",
                    margin: "0 auto 10px",
                    boxShadow: `0 0 0 3px ${profile.color}22, 0 0 30px ${profile.color}35`,
                    transition: "all 0.5s ease",
                  }}>{profile.avatar}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                    {profile.name}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3, fontFamily: "monospace" }}>
                    {profile.role}
                  </div>
                  <div style={{
                    display: "inline-block", marginTop: 8,
                    fontSize: 9, padding: "3px 10px", borderRadius: 20,
                    background: `${profile.color}18`, color: profile.color,
                    fontFamily: "monospace", border: `1px solid ${profile.color}30`,
                  }}>
                    ✦ {profile.tagline}
                  </div>
                  <div style={{
                    fontSize: 10, marginTop: 8, color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.5, fontFamily: "monospace", padding: "0 8px",
                  }}>{profile.bio}</div>
                </div>

                {/* Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.links.map((link, i) => (
                    <div key={link.label} style={{
                      padding: "10px 14px", borderRadius: 10,
                      fontSize: 10, fontWeight: 600, textAlign: "center",
                      transition: "all 0.3s ease", cursor: "pointer",
                      ...(link.type === "primary" ? {
                        background: `linear-gradient(135deg, ${profile.color}, ${profile.color}cc)`,
                        color: "#fff",
                        boxShadow: `0 4px 20px ${profile.color}55`,
                      } : link.type === "secondary" ? {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.75)",
                        border: `1px solid ${profile.color}25`,
                      } : {
                        background: "transparent",
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }),
                    }}>
                      {link.label}
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 18, fontSize: 8, color: "rgba(255,255,255,0.1)", fontFamily: "monospace" }}>
                  ◆ LINKFOLIO
                </div>
              </div>
            </div>
          </div>

          {/* View live demo button */}
          <button
            onClick={viewDemo}
            style={{
              padding: "10px 24px", borderRadius: 20,
              border: `1px solid ${profile.color}50`,
              background: `${profile.color}10`,
              color: profile.color, fontSize: 11,
              fontFamily: "monospace", letterSpacing: "0.1em",
              cursor: "pointer", transition: "all 0.25s ease",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.background = `${profile.color}25`;
              b.style.boxShadow = `0 0 20px ${profile.color}30`;
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.background = `${profile.color}10`;
              b.style.boxShadow = "none";
            }}
          >
            VIEW {profile.name.split(" ")[0].toUpperCase()}'S LIVE PROFILE ↗
          </button>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{
        position: "relative", zIndex: 5,
        borderTop: "1px solid rgba(225,29,72,0.08)",
        borderBottom: "1px solid rgba(225,29,72,0.08)",
        padding: "12px 0", background: "rgba(225,29,72,0.02)",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", gap: 48, animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(3)].fill([
            "Real Estate Agents", "SaaS Founders", "Photographers", "Life Coaches",
            "Consultants", "Fitness Trainers", "Lawyers", "Freelancers", "Musicians", "Therapists",
          ]).flat().map((item, i) => (
            <span key={i} style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
              {i % 2 === 0 ? "◆" : "·"} {(item as string).toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM / SOLUTION ── */}
      <section style={{ position: "relative", zIndex: 5, padding: "100px 48px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#E11D48", marginBottom: 20 }}>
              MOST TOOLS GET THIS WRONG
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-1.5px", margin: "0 0 28px", lineHeight: 1.1 }}>
              Other platforms blur
              <br />
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.25)" }}>the lines between users.</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { pain: "Shared templates mean your profile looks identical to a thousand others." },
                { pain: "Your edits, your branding, your visitor data — all sitting in one giant shared pool." },
                { pain: "No real separation between accounts means no real ownership of your space." },
                { pain: "It feels rented, not owned. Like you're a guest, not a tenant." },
              ].map(({ pain }, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#E11D48",
                  }}>✕</div>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "monospace" }}>{pain}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#4ade80", marginBottom: 20 }}>
              LINKFOLIO IS BUILT DIFFERENT
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-1.5px", margin: "0 0 28px", lineHeight: 1.1 }}>
              Every account is its
              <br />
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.25)" }}>own isolated tenant.</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { fix: "Your profile, your links, your data — scoped to you and only you, at the database level." },
                { fix: "Your own subdomain-style URL. linkfolio.app/you. No one else touches it." },
                { fix: "Edit in your private workspace. Visitors only ever see your published version." },
                { fix: "One platform, thousands of separate rooms. Yours is locked to you." },
              ].map(({ fix }, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#4ade80",
                  }}>✓</div>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "monospace" }}>{fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        position: "relative", zIndex: 5,
        padding: "80px 48px",
        borderTop: "1px solid rgba(225,29,72,0.08)",
        background: "rgba(225,29,72,0.02)",
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#E11D48", marginBottom: 16 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: 46, fontWeight: 400, margin: 0, letterSpacing: "-1.5px" }}>
              Claim your tenant
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.3)" }}> in under 60 seconds.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{
                padding: "36px 28px",
                background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                border: "1px solid rgba(225,29,72,0.07)",
                position: "relative",
              }}>
                <div style={{
                  fontSize: 11, fontFamily: "monospace", color: "rgba(225,29,72,0.4)",
                  letterSpacing: "0.2em", marginBottom: 16,
                }}>{step.n}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, letterSpacing: "-0.3px" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  {step.body}
                </div>
                {i < 3 && (
                  <div style={{
                    position: "absolute", right: -12, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16, color: "rgba(225,29,72,0.3)", zIndex: 1,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ position: "relative", zIndex: 5, padding: "100px 48px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#E11D48", marginBottom: 16 }}>
            REAL RESULTS
          </div>
          <h2 style={{ fontSize: 46, fontWeight: 400, margin: 0, letterSpacing: "-1.5px" }}>
            They stopped guessing.
            <br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.3)" }}>Started converting.</span>
          </h2>
        </div>

        {/* Active testimonial */}
        <div style={{
          maxWidth: 720, margin: "0 auto 40px",
          padding: "48px",
          border: `1px solid ${testimonial.color}25`,
          borderRadius: 4, background: `${testimonial.color}05`,
          position: "relative", transition: "all 0.4s ease",
        }}>
          <div style={{
            fontSize: 48, color: testimonial.color, opacity: 0.3,
            fontFamily: "Georgia", lineHeight: 1, marginBottom: 16,
          }}>"</div>
          <p style={{
            fontSize: 19, lineHeight: 1.7, fontStyle: "italic",
            color: "rgba(255,255,255,0.8)", margin: "0 0 28px",
            letterSpacing: "-0.2px",
          }}>
            {testimonial.quote}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{testimonial.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginTop: 3 }}>
                {testimonial.role}
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 20,
              background: `${testimonial.color}15`,
              border: `1px solid ${testimonial.color}30`,
              fontSize: 11, fontFamily: "monospace", color: testimonial.color,
            }}>
              ✦ {testimonial.result}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {TESTIMONIALS.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              style={{
                width: i === activeTestimonial ? 24 : 8, height: 8,
                borderRadius: 4,
                background: i === activeTestimonial ? t.color : "rgba(255,255,255,0.15)",
                border: "none", cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: i === activeTestimonial ? `0 0 10px ${t.color}60` : "none",
              }}
            />
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{
        position: "relative", zIndex: 5, padding: "80px 48px",
        borderTop: "1px solid rgba(225,29,72,0.08)",
        background: "rgba(225,29,72,0.02)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#E11D48", marginBottom: 16 }}>
            PRICING
          </div>
          <h2 style={{ fontSize: 46, fontWeight: 400, margin: "0 0 16px", letterSpacing: "-1.5px" }}>
            Free while it counts.
            <br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.3)" }}>Upgrade when you're ready.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: 56, lineHeight: 1.7 }}>
            No hidden fees. No "feature locked" frustrations. Your full profile is free forever.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 700, margin: "0 auto" }}>
            {[
              {
                name: "Free", price: "$0", note: "forever",
                features: ["Unlimited links", "Custom accent color", "Live preview editor", "Public profile URL", "Basic analytics"],
                cta: "Start free →", primary: false,
              },
              {
                name: "Pro", price: "$9", note: "per month",
                features: ["Everything in Free", "Custom domain", "Remove Linkfolio branding", "Advanced analytics", "Priority support"],
                cta: "Start free trial →", primary: true,
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                padding: "40px 36px",
                background: plan.primary ? "rgba(225,29,72,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${plan.primary ? "rgba(225,29,72,0.3)" : "rgba(255,255,255,0.06)"}`,
                position: "relative",
              }}>
                {plan.primary && (
                  <div style={{
                    position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #C41230, #E11D48)",
                    padding: "4px 16px", fontSize: 9,
                    fontFamily: "monospace", letterSpacing: "0.15em", color: "#fff",
                    borderRadius: "0 0 6px 6px",
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: 12 }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1px" }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{plan.note}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "20px 0", paddingTop: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                      <span style={{ color: "#E11D48", fontSize: 12 }}>◆</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" style={{
                  display: "block", textAlign: "center",
                  padding: "12px 24px", borderRadius: 4,
                  background: plan.primary ? "linear-gradient(135deg, #C41230, #E11D48)" : "rgba(255,255,255,0.05)",
                  border: plan.primary ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", textDecoration: "none",
                  fontSize: 13, fontFamily: "monospace", letterSpacing: "0.05em",
                  boxShadow: plan.primary ? "0 0 24px rgba(225,29,72,0.3)" : "none",
                }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ position: "relative", zIndex: 5, padding: "100px 48px 120px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", color: "#E11D48", marginBottom: 24 }}>
            YOUR SPACE IS WAITING
          </div>
          <h2 style={{ fontSize: 56, fontWeight: 400, margin: "0 0 20px", letterSpacing: "-2px", lineHeight: 1.05 }}>
            Thousands have
            <br />
            claimed their{" "}
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #FF6B35, #E11D48, #FB7185)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              own tenant.
            </span>
            <br />
            Yours is still open.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: 40, lineHeight: 1.8 }}>
            60 seconds. No card. No shared space.<br />Just a profile that's entirely, permanently yours.
          </p>
          <Link href="/register" style={{
            display: "inline-block",
            padding: "18px 48px", borderRadius: 4,
            background: "linear-gradient(135deg, #C41230, #E11D48, #FB7185)",
            color: "#fff", textDecoration: "none",
            fontSize: 15, fontFamily: "monospace", letterSpacing: "0.06em",
            boxShadow: "0 0 80px rgba(225,29,72,0.5), 0 8px 40px rgba(0,0,0,0.4)",
          }}>
            Build my free profile — it takes 60 seconds →
          </Link>
          <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
            No credit card · Cancel anytime · Live instantly
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 5,
        borderTop: "1px solid rgba(225,29,72,0.08)",
        padding: "24px 48px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace", fontWeight: 700,
          background: "linear-gradient(135deg, #FF6B35, #E11D48)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>◆ LINKFOLIO</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
          © 2025 Linkfolio · Built for professionals who are serious about their work.
        </div>
      </footer>
    </main>
  );
}