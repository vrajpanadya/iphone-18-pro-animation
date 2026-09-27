import type { Metadata } from "next";
import PhoneScrollSequence from "./components/PhoneScrollSequence";

export const metadata: Metadata = {
  title: "iPhone 18 Pro — Forged in Titanium",
  description:
    "Experience the iPhone 18 Pro. A20 Bionic, titanium design, and intelligence fused into every component. Pre-order now.",
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a]">
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2">
          {/* Apple-style logo mark */}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white/80"
            fill="currentColor"
            aria-label="Apple Logo"
          >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </div>

        <div className="hidden sm:flex items-center gap-8 text-[13px] font-medium text-white/50">
          <a href="#" className="transition-colors hover:text-white/90">
            Overview
          </a>
          <a href="#" className="transition-colors hover:text-white/90">
            Specs
          </a>
          <a href="#" className="transition-colors hover:text-white/90">
            Compare
          </a>
        </div>

        <a
          href="#"
          className="text-[13px] font-medium px-5 py-2 rounded-full bg-white/[0.08] text-white/80 backdrop-blur-md border border-white/[0.06] transition-all hover:bg-white/[0.14] hover:text-white hover:border-white/[0.12]"
        >
          Pre-order
        </a>
      </nav>

      {/* ── Scroll Sequence ─────────────────────────────── */}
      <PhoneScrollSequence />

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="relative z-10 bg-[#0a0a0a] border-t border-white/[0.04]">
        {/* Specs strip */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {[
              { label: "Display", value: '6.9"', detail: "ProMotion LTPO OLED" },
              { label: "Chip", value: "A20", detail: "3nm · 6-core GPU" },
              { label: "Camera", value: "48MP", detail: "Fusion · 5× Optical" },
              { label: "Battery", value: "29h", detail: "Video playback" },
            ].map((spec) => (
              <div key={spec.label} className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
                  {spec.label}
                </span>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white/90">
                  {spec.value}
                </span>
                <span className="text-sm text-white/40">{spec.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © 2026 Apple Inc. All rights reserved. This is a fictional product
            demo.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white/50 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white/50 transition-colors">
              Site Map
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
