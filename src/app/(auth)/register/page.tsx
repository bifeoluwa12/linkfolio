// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

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

  // If landing page passed a niche via URL, jump to step 2 with it pre-selected
  useEffect(() => {
    const n = searchParams.get("niche");
    if (n && NICHES.find(x => x.value === n)) {
      setForm(f => ({ ...f, niche: n }));
      setStep(2);
    }
  }, [searchParams]);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      username: (!f.username || f.username === slugify(f.name))
        ? slugify(name)
        : f.username,
    }));
    setError("");
  }

  function validateStep(): string {
    if (step === 0) {
      if (!form.name.trim()) return "Enter your full name.";
      if (!form.email.trim()) return "Enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
    }
    if (step === 1) {
      if (!form.username || form.username.length < 3) return "Username must be at least 3 characters.";
    }
    if (step === 2) {
      if (!form.niche) return "Pick your niche to continue.";
    }
    return "";
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Something went wrong.");
      if (data.error?.toLowerCase().includes("email")) setStep(0);
      if (data.error?.toLowerCase().includes("username")) setStep(1);
      return;
    }

    // Account created — sign them in immediately, no separate login step
    const signInResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      // Fallback: account exists but auto-login failed for some reason —
      // send them to login with a flag so they're not stuck on a dead page
      router.push("/login?registered=1");
      return;
    }

    // Straight into their brand-new profile editor
    router.push("/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "13px 16px", color: "#fff", fontSize: 14,
    outline: "none", fontFamily: "monospace", letterSpacing: "0.02em",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };

  const labelBase: React.CSSProperties = {
    fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace",
    letterSpacing: "0.15em", display: "block", marginBottom: 8,
    textTransform: "uppercase",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080004",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Georgia', serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus { border-color: #E11D48 !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 60% 0%, rgba(225,29,72,0.12) 0%, transparent 60%)",
      }} />

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10, animation: "fadeUp 0.5s ease both" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 12, letterSpacing: "0.35em", fontFamily: "monospace",
            background: "linear-gradient(135deg, #FF6B35, #E11D48, #FB7185)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontWeight: 700, marginBottom: 24,
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

        {/* Step bar */}
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
                transition: "color 0.3s",
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

          {/* STEP 0 */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelBase}>Full Name</label>
                <input style={inputBase} value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Alex Morgan" autoFocus />
              </div>
              <div>
                <label style={labelBase}>Email Address</label>
                <input style={inputBase} type="email" value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="alex@example.com" />
              </div>
              <div>
                <label style={labelBase}>Password</label>
                <input style={inputBase} type="password" value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="Min 8 characters"
                  onKeyDown={e => e.key === "Enter" && nextStep()} />
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelBase}>Your Public URL</label>
                <div style={{
                  display: "flex", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden",
                }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = "#E11D48")}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <span style={{
                    padding: "13px 14px", fontSize: 13, fontFamily: "monospace",
                    color: "rgba(255,255,255,0.25)", borderRight: "1px solid rgba(255,255,255,0.08)",
                    whiteSpace: "nowrap",
                  }}>linkfolio.app/</span>
                  <input
                    style={{ ...inputBase, border: "none", borderRadius: 0, background: "transparent" }}
                    value={form.username}
                    onChange={e => update("username", slugify(e.target.value))}
                    placeholder="alex-morgan" autoFocus
                    onKeyDown={e => e.key === "Enter" && nextStep()}
                  />
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 8 }}>
                  Lowercase letters, numbers, and hyphens only.
                </p>
              </div>
              {form.username && (
                <div style={{
                  padding: "14px 16px", background: "rgba(225,29,72,0.05)",
                  border: "1px solid rgba(225,29,72,0.15)", borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #C41230, #E11D48)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {form.name ? form.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2) : "?"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{form.name || "Your Name"}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#E11D48", marginTop: 2 }}>
                      linkfolio.app/{form.username}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelBase}>I am a...</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {NICHES.map(n => (
                    <button key={n.value} onClick={() => update("niche", n.value)} style={{
                      padding: "11px 14px", borderRadius: 10, fontSize: 12,
                      fontFamily: "monospace", textAlign: "left",
                      cursor: "pointer", transition: "all 0.2s ease",
                      border: form.niche === n.value ? "1px solid #E11D48" : "1px solid rgba(255,255,255,0.08)",
                      background: form.niche === n.value ? "rgba(225,29,72,0.12)" : "rgba(255,255,255,0.03)",
                      color: form.niche === n.value ? "#fff" : "rgba(255,255,255,0.5)",
                      boxShadow: form.niche === n.value ? "0 0 16px rgba(225,29,72,0.2)" : "none",
                    }}>{n.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelBase}>Your power line <span style={{ color: "rgba(255,255,255,0.2)" }}>(optional)</span></label>
                <input style={inputBase} value={form.tagline}
                  onChange={e => update("tagline", e.target.value)}
                  placeholder={`e.g. "Closed $4.2M last quarter"`}
                  maxLength={60} />
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 6 }}>
                  Shown under your name on your public profile.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(225,29,72,0.08)",
              border: "1px solid rgba(225,29,72,0.25)",
              borderRadius: 8, fontSize: 12,
              color: "#FB7185", fontFamily: "monospace",
            }}>✕ {error}</div>
          )}

          {/* Buttons */}
          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError(""); }} style={{
                padding: "13px 20px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.4)",
                fontSize: 13, fontFamily: "monospace", cursor: "pointer",
              }}>← Back</button>
            )}
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
              {loading ? "Creating your profile..." : step < 2 ? `Continue → (${step + 1}/3)` : "Launch my profile →"}
            </button>
          </div>
        </div>

        <p style={{
          textAlign: "center", marginTop: 24,
          fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace",
        }}>
          Already have a profile?{" "}
          <Link href="/login" style={{ color: "#E11D48", textDecoration: "none" }}>Sign in →</Link>
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