import React, { useEffect, useState } from "react";

/* Shared animation shell for the auth pages (login/register).
   Visual/animation layer only — no form logic, no routes, no API calls.
   Styles live in src/styles/auth-animations.css (imported by Authlayout). */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- ambient background: parallax dotted grid + 3 blurred blobs ---- */
export function AuthAmbient() {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return; // parallax off on mobile
    const onMove = (e) => {
      setP({
        x: (e.clientX / window.innerWidth - 0.5) * -14, // max ~7px
        y: (e.clientY / window.innerHeight - 0.5) * -14,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[10%] opacity-[.35] blur-[80px]"
      >
        <div
          className="csf-blob-a absolute left-[6%] top-[8%] h-[38vw] w-[38vw]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(23,49,81,.30), rgba(23,49,81,0) 70%)",
          }}
        />
        <div
          className="csf-blob-b absolute right-[4%] top-[22%] h-[32vw] w-[32vw]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(241,181,0,.26), rgba(241,181,0,0) 70%)",
          }}
        />
        <div
          className="csf-blob-c absolute bottom-[-6%] left-[38%] h-[34vw] w-[34vw]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(29,53,87,.22), rgba(29,53,87,0) 70%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="csf-grid pointer-events-none absolute -inset-4"
        style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}
      />
    </>
  );
}

/* ---- soccer motif: thin line-art ball rolling the card's bottom edge ---- */
export function RollingBall() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-[13px] left-0 right-0 h-[26px] overflow-hidden opacity-50"
    >
      <svg className="csf-ball" width="26" height="26" viewBox="0 0 26 26">
        <g
          fill="none"
          stroke="#173151"
          strokeWidth="1"
          strokeLinejoin="round"
        >
          <circle cx="13" cy="13" r="11.5" />
          <path d="M13 6.2l4.6 3.3-1.8 5.4h-5.6L8.4 9.5z" />
          <path d="M13 6.2V1.6M17.6 9.5l4.3-1.5M15.8 14.9l3.4 3.9M10.2 14.9l-3.4 3.9M8.4 9.5L4.1 8" />
        </g>
      </svg>
    </div>
  );
}

/* ---- the card stage: entrance rise, shake on invalid, slide-out on success.
   Wraps each page's EXISTING card markup — pass shake (timestamp|0) and
   leaving (bool). csf-scope enables the input-focus/label-lift styling for
   everything inside without per-field classes. ---- */
export default function AuthStage({ children, shake, leaving, className = "" }) {
  return (
    <div className="csf-exit" data-leaving={leaving ? "true" : "false"}>
      {/* key remount replays the shake keyframes on every failed submit */}
      <div key={shake || "still"} className={shake ? "csf-shake" : ""}>
        <div className={"csf-rise csf-scope relative " + className}>
          <RollingBall />
          {children}
        </div>
      </div>
    </div>
  );
}
