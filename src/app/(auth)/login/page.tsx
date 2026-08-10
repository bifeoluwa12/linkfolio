// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── Bulletproof regex validators ─────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validate(email: string, password: string): string {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setShowSuccess(true);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate BEFORE touching the network — never fire empty requests
    const err = validate(email, password);
    if (err) { setError(err); return; }

    // Disable button immediately to block duplicate submissions
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Generic message — never reveal whether the email exists
      setError("Incorrect email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
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

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 60% 0%, rgba(225,29,72,0.1) 0%, transparent 60%)",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 12, letterSpacing: "0.35em", fontFamily: "monospace", fontWeight: 700,
            background: "linear-gradient(135deg, #FF6B35, #E11D48, #FB7185)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 20,
          }}>◆ LINKFOLIO</div>
          <h1 style={{ fontSize: 28, fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.8px", color: "#fff" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, fontFamily: "monospace" }}>
            Sign in to your profile studio
          </p>
        </div>

        {/* Registration success banner */}
        {showSuccess && (
          <div style={{
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.25)",
            borderRadius: 10, fontSize: 12,
            color: "#4ade80", fontFamily: "monospace", textAlign: "center",
          }}>
            ✓ Account created — sign in to launch your profile
          </div>
        )}

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(225,29,72,0.12)",
          borderRadius: 16, padding: "36px 32px",
          boxShadow: "0 0 60px rgba(225,29,72,0.06), 0 24px 60px rgba(0,0,0,0.4)",
        }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelBase}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                style={inputBase}
                onKeyDown={e => { if (e.key === "Enter" && loading) e.preventDefault(); }}
              />
            </div>

            <div>
              <label style={labelBase}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputBase}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(225,29,72,0.08)",
                border: "1px solid rgba(225,29,72,0.25)",
                borderRadius: 8, fontSize: 12,
                color: "#FB7185", fontFamily: "monospace",
              }}>✕ {error}</div>
            )}

            {/* Disabled while loading — prevents duplicate network calls */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px 24px", borderRadius: 10,
                background: loading ? "rgba(225,29,72,0.4)" : "linear-gradient(135deg, #C41230, #E11D48)",
                border: "none", color: "#fff", fontSize: 14,
                fontFamily: "monospace", letterSpacing: "0.04em",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 30px rgba(225,29,72,0.3)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center", marginTop: 24, fontSize: 12,
          color: "rgba(255,255,255,0.25)", fontFamily: "monospace",
        }}>
          No account?{" "}
          <Link href="/register" style={{ color: "#E11D48", textDecoration: "none" }}>
            Build your free profile →
          </Link>
        </p>

        <div style={{
          marginTop: 20, padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 10, textAlign: "center",
        }}>
          <p style={{
            fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace",
            letterSpacing: "0.15em", marginBottom: 8, margin: "0 0 8px",
          }}>DEMO ACCOUNTS</p>
          {["alex@linkfolio.app / password123", "priya@linkfolio.app / password123"].map(line => (
            <div key={line} style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}