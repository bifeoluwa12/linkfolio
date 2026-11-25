"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

// ── Regex validators — same rules as the API ─────────────────────────────────
const EMAIL_RE    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const USERNAME_RE = /^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/;
const NAME_RE     = /^[\p{L}\p{M}\s'\-\.]{2,60}$/u;

const RESERVED = new Set([
  "admin","api","dashboard","login","register","logout","settings",
  "profile","help","support","about","terms","privacy","app","www",
  "mail","blog","docs","status","linkfolio",
]);

const NICHES = [
  { value: "real_estate",  label: "🏠 Real Estate Agent" },
  { value: "saas_founder", label: "🚀 SaaS Founder" },
  { value: "photographer", label: "📸 Photographer" },
  { value: "coach",        label: "🎯 Coach" },
  { value: "consultant",   label: "💼 Consultant" },
  { value: "musician",     label: "🎵 Musician" },
  { value: "lawyer",       label: "⚖️ Lawyer" },
  { value: "freelancer",   label: "💻 Freelancer" },
  { value: "fitness",      label: "💪 Fitness Trainer" },
  { value: "therapist",    label: "🧠 Therapist" },
  { value: "other",        label: "✦ Other" },
];

const STEPS = ["Account", "Identity", "Niche"];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    username: "", niche: "", tagline: "",
  });

  // Pre-select niche if passed from landing page
useEffect(() => {
  const n = searchParams.get("niche");

  if (n && NICHES.find(x => x.value === n)) {
    setForm(f => ({ ...f, niche: n }));
  }
}, [searchParams]);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f, name,
      username: (!f.username || f.username === slugify(f.name)) ? slugify(name) : f.username,
    }));
    setError("");
  }

  // ── Client-side validation mirrors server rules exactly ───────────────────
  function validateStep(): string {
    if (step === 0) {
      if (!form.name.trim()) return "Full name is required.";
      if (!NAME_RE.test(form.name.trim())) return "Name contains invalid characters.";
      if (!form.email.trim()) return "Email address is required.";
      if (!EMAIL_RE.test(form.email.trim())) return "Enter a valid email address.";
      if (!form.password) return "Password is required.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password.length > 128) return "Password is too long.";
    }
    if (step === 1) {
      if (!form.username) return "Username is required.";
      if (!USERNAME_RE.test(form.username)) {
        return "Username must be 3–30 characters, lowercase letters, numbers, and hyphens only. Cannot start or end with a hyphen.";
      }
      if (RESERVED.has(form.username)) return "That username is reserved. Please choose another.";
    }
    if (step === 2) {
      if (!form.niche) return "Pick your niche to continue.";
    }
    return "";
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

async function handleSubmit() {
  const err = validateStep();
  if (err) { setError(err); return; }

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        username: form.username,
        niche: form.niche,
        tagline: form.tagline.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login?registered=1");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  } catch (error) {
    console.error("Registration error:", error);
    setError("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
    // Account created — sign in immediately, no separate login step
    const signInResult = await signIn("credentials", {
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      // Edge case: account created but auto-login failed
      router.push("/login?registered=1");
      return;
    }

    // Straight into their new profile studio
    router.push("/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "13px 16px", color: "#fff", fontSize: 14,
    outline: "none", fontFamily: "monospace", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelBase: React.CSSProperties = {
    fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace",
    letterSpacing: "0.15em", display: "block", marginBottom: 8,
    textTransform: "uppercase",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080004", fontFamily: "'Georgia', serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <style>{`
        input:focus { border-color: #E11D48 !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 60% 0%, rgba(225,29,72,0.12) 0%, transparent 60%)" }} />

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 12, letterSpacing: "0.35em", fontFamily: "monospace", fontWeight: 700,
            background: "linear-gradient(135deg, #FF6B35, #E11D48, #FB7185)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 24,
          }}>◆ LINKFOLIO</div>
          <h1 style={{ fontSize: 30, fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.8px", color: "#fff" }}>
            {step === 0 && "Create your account"}
            {step === 1 && "Claim your URL"}
            {step === 2 && "What do you do?"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, fontFamily: "monospace" }}>
            {step === 0 && "Free forever. No card required."}
            {step === 1 && "Your permanent public profile link."}
            {step === 2 && "We'll tailor your profile to your industry."}
          </p>
        </div>

        {/* Step progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <div style={{
                height: 3, width: "100%", borderRadius: 2,
                background: i <= step ? "linear-gradient(90deg, #C41230, #E11D48)" : "rgba(255,255,255,0.08)",
                transition: "background 0.3s ease",
                boxShadow: i <= step ? "0 0 8px rgba(225,29,72,0.4)" : "none",
              }} />
              <span style={{
                fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em",
                color: i <= step ? "#E11D48" : "rgba(255,255,255,0.2)",
              }}>{s.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(225,29,72,0.12)",
          borderRadius: 16, padding: "36px 32px",
          boxShadow: "0 0 60px rgba(225,29,72,0.06), 0 24px 60px rgba(0,0,0,0.4)",
        }}>

          {/* ── STEP 0: Account ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelBase}>Full Name</label>
                <input
                  style={inputBase} value={form.name} autoFocus
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Alex Morgan" maxLength={60}
                  onKeyDown={e => { if (e.key === "Enter" && !loading) nextStep(); }}
                />
              </div>
              <div>
                <label style={labelBase}>Email Address</label>
                <input
                  style={inputBase} type="email" value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="alex@example.com" autoComplete="email"
                  onKeyDown={e => { if (e.key === "Enter" && !loading) nextStep(); }}
                />
              </div>
              <div>
                <label style={labelBase}>Password</label>
                <input
                  style={inputBase} type="password" value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="Min 8 characters" maxLength={128}
                  autoComplete="new-password"
                  onKeyDown={e => { if (e.key === "Enter" && !loading) nextStep(); }}
                />
                {/* Password strength hint */}
                {form.password.length > 0 && form.password.length < 8 && (
                  <p style={{ fontSize: 10, color: "#FB7185", fontFamily: "monospace", marginTop: 6 }}>
                    {8 - form.password.length} more character{8 - form.password.length !== 1 ? "s" : ""} needed
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 1: Username ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelBase}>Your Public URL</label>
                <div style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, overflow: "hidden",
                }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = "#E11D48")}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <span style={{
                    padding: "13px 14px", fontSize: 13, fontFamily: "monospace",
                    color: "rgba(255,255,255,0.25)", borderRight: "1px solid rgba(255,255,255,0.08)",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>linkfolio.app/</span>
                  <input
                    style={{ ...inputBase, border: "none", borderRadius: 0, background: "transparent" }}
                    value={form.username}
                    onChange={e => update("username", slugify(e.target.value))}
                    placeholder="alex-morgan" autoFocus maxLength={30}
                    onKeyDown={e => { if (e.key === "Enter" && !loading) nextStep(); }}
                  />
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 8 }}>
                  3–30 characters. Lowercase, numbers, hyphens. Cannot be changed later.
                </p>
              </div>

              {/* Live preview card */}
              {form.username && USERNAME_RE.test(form.username) && !RESERVED.has(form.username) && (
                <div style={{
                  padding: "14px 16px",
                  background: "rgba(225,29,72,0.05)",
                  border: "1px solid rgba(225,29,72,0.15)",
                  borderRadius: 10, display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, #C41230, #E11D48)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {form.name ? form.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{form.name || "Your Name"}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#E11D48", marginTop: 2 }}>
                      linkfolio.app/{form.username}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }}>
                    ✓ AVAILABLE
                  </div>
                </div>
              )}

              {/* Show warning for reserved names */}
              {form.username && RESERVED.has(form.username) && (
                <div style={{
                  padding: "10px 14px", background: "rgba(225,29,72,0.08)",
                  border: "1px solid rgba(225,29,72,0.25)", borderRadius: 8,
                  fontSize: 12, color: "#FB7185", fontFamily: "monospace",
                }}>
                  ✕ That username is reserved. Please choose another.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Niche ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelBase}>I am a...</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {NICHES.map(n => (
                    <button
                      key={n.value}
                      onClick={() => update("niche", n.value)}
                      style={{
                        padding: "11px 14px", borderRadius: 10, fontSize: 12,
                        fontFamily: "monospace", textAlign: "left",
                        cursor: "pointer", transition: "all 0.2s ease",
                        border: form.niche === n.value ? "1px solid #E11D48" : "1px solid rgba(255,255,255,0.08)",
                        background: form.niche === n.value ? "rgba(225,29,72,0.12)" : "rgba(255,255,255,0.03)",
                        color: form.niche === n.value ? "#fff" : "rgba(255,255,255,0.5)",
                        boxShadow: form.niche === n.value ? "0 0 16px rgba(225,29,72,0.2)" : "none",
                      }}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelBase}>
                  Power line{" "}
                  <span style={{ color: "rgba(255,255,255,0.2)", textTransform: "none" }}>(optional)</span>
                </label>
                <input
                  style={inputBase} value={form.tagline}
                  onChange={e => update("tagline", e.target.value.slice(0, 60))}
                  placeholder={`e.g. "Closed $4.2M last quarter"`}
                  maxLength={60}
                />
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 6 }}>
                  {form.tagline.length}/60 · Shown under your name on your public profile.
                </p>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(225,29,72,0.08)",
              border: "1px solid rgba(225,29,72,0.25)",
              borderRadius: 8, fontSize: 12,
              color: "#FB7185", fontFamily: "monospace",
            }}>✕ {error}</div>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => { setStep(s => s - 1); setError(""); }}
                disabled={loading}
                style={{
                  padding: "13px 20px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "rgba(255,255,255,0.4)",
                  fontSize: 13, fontFamily: "monospace", cursor: "pointer",
                }}
              >
                ← Back
              </button>
            )}

            {/* Primary action — disabled during loading to prevent duplicate calls */}
            <button
              onClick={step < 2 ? nextStep : handleSubmit}
              disabled={loading}
              style={{
                flex: 1, padding: "13px 24px", borderRadius: 10,
                background: loading ? "rgba(225,29,72,0.4)" : "linear-gradient(135deg, #C41230, #E11D48)",
                border: "none", color: "#fff", fontSize: 14,
                fontFamily: "monospace", letterSpacing: "0.04em",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 30px rgba(225,29,72,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading
                ? "Creating your profile…"
                : step < 2
                  ? `Continue → (${step + 1}/3)`
                  : "Launch my profile →"}
            </button>
          </div>
        </div>

        <p style={{
          textAlign: "center", marginTop: 24, fontSize: 12,
          color: "rgba(255,255,255,0.25)", fontFamily: "monospace",
        }}>
          Already have a profile?{" "}
          <Link href="/login" style={{ color: "#E11D48", textDecoration: "none" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}