"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";

// ─── Config ─────────────────────────────────────────────
const TOTAL_FRAMES = 40;
const FRAME_PREFIX = "/iphoneanimatied/ezgif-frame-";
const FRAME_SUFFIX = ".jpg";


function padIndex(i: number): string {
  return String(i).padStart(3, "0");
}

function getFramePath(index: number): string {
  return `${FRAME_PREFIX}${padIndex(index + 1)}${FRAME_SUFFIX}`;
}

// ─── Text overlay sections ──────────────────────────────
interface TextSection {
  id: string;
  /** Scroll progress range [start, end] where this section is visible */
  range: [number, number];
  /** Peak visibility point */
  peak: number;
  headline: string;
  subline: string;
  align: "center" | "left" | "right";
}

const TEXT_SECTIONS: TextSection[] = [
  {
    id: "hero",
    range: [0, 0.18],
    peak: 0.04,
    headline: "iPhone 18 Pro",
    subline: "Forged in titanium. Fused with intelligence.",
    align: "center",
  },
  {
    id: "feature-1",
    range: [0.22, 0.42],
    peak: 0.32,
    headline: "A20 Bionic",
    subline:
      "The fastest chip ever in a smartphone. 3nm architecture pushes the boundaries of what's possible.",
    align: "left",
  },
  {
    id: "feature-2",
    range: [0.50, 0.72],
    peak: 0.60,
    headline: "Engineered Inside Out",
    subline:
      "Every component precision-milled. Every connection purpose-built. Zero compromise.",
    align: "right",
  },
  {
    id: "cta",
    range: [0.80, 1.0],
    peak: 0.92,
    headline: "Brilliance, Assembled.",
    subline: "Pre-order September 30 →",
    align: "center",
  },
];

// ─── Preloader ──────────────────────────────────────────
function useImagePreloader() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          loadedImages[i] = img;
          loadedCount++;
          setProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          resolve();
        };
        img.onerror = () => {
          // Still resolve so we don't hang — blank frame fallback
          loadedCount++;
          setProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          resolve();
        };
      });
    });

    Promise.all(promises).then(() => {
      setImages(loadedImages);
      setIsLoaded(true);
    });
  }, []);

  return { images, progress, isLoaded };
}

// ─── Canvas renderer ────────────────────────────────────
function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  images: HTMLImageElement[]
) {
  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !images[index]) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const img = images[index];
      const dpr = window.devicePixelRatio || 1;

      // Resize canvas to fill viewport at native resolution
      const rect = canvas.getBoundingClientRect();
      const canvasW = rect.width * dpr;
      const canvasH = rect.height * dpr;

      if (canvas.width !== canvasW || canvas.height !== canvasH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
      }

      // Fill background to match site
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvasW, canvasH);

      // "contain" fit — scale image to fit within canvas
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasW / canvasH;

      let drawW: number, drawH: number, drawX: number, drawY: number;

      if (imgAspect > canvasAspect) {
        // Image wider than canvas
        drawW = canvasW;
        drawH = canvasW / imgAspect;
        drawX = 0;
        drawY = (canvasH - drawH) / 2;
      } else {
        // Image taller than canvas
        drawH = canvasH;
        drawW = canvasH * imgAspect;
        drawX = (canvasW - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    },
    [canvasRef, images]
  );

  return { renderFrame };
}

// ─── Loading Screen ─────────────────────────────────────
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(139, 34, 82, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="loader-spinner" />

        {/* Progress */}
        <div className="flex flex-col items-center gap-3">
          <span className="loader-text text-sm font-medium tracking-[0.3em] uppercase">
            iPhone 18 Pro
          </span>

          {/* Progress bar */}
          <div className="relative h-[2px] w-48 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, rgba(139, 34, 82, 0.8), rgba(196, 77, 123, 0.9))",
              }}
            />
          </div>

          <span className="text-xs tabular-nums text-white/30 font-mono">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Text Overlay ───────────────────────────────────────
function ScrollTextOverlay({
  section,
  scrollProgress,
}: {
  section: TextSection;
  scrollProgress: number;
}) {
  const { range, peak, headline, subline, align } = section;

  // Calculate opacity: fade in from range[0] → peak, fade out from peak → range[1]
  let opacity = 0;
  if (scrollProgress >= range[0] && scrollProgress <= range[1]) {
    if (scrollProgress <= peak) {
      // Fade in
      opacity = Math.min(1, (scrollProgress - range[0]) / (peak - range[0]));
    } else {
      // Fade out
      opacity = Math.max(0, 1 - (scrollProgress - peak) / (range[1] - peak));
    }
  }

  // Parallax / slide effect
  const translateY =
    scrollProgress < peak
      ? (1 - opacity) * 40 // slide up while fading in
      : -opacity * 10 + (1 - opacity) * -20; // slight drift up while fading out

  if (opacity < 0.01) return null;

  const alignmentClasses = {
    center: "items-center text-center",
    left: "items-start text-left pl-8 sm:pl-16 md:pl-24 lg:pl-32",
    right: "items-end text-right pr-8 sm:pr-16 md:pr-24 lg:pr-32",
  };

  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col justify-center pointer-events-none ${alignmentClasses[align]}`}
      style={{
        opacity: opacity ** 1.5, // Ease the opacity curve
        transform: `translateY(${translateY}px)`,
        willChange: "opacity, transform",
      }}
    >
      <h2
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 max-w-2xl"
        style={{
          textShadow: "0 4px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {headline}
      </h2>
      <p
        className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/60 max-w-md leading-relaxed"
        style={{
          textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          opacity: Math.min(1, opacity * 1.3),
          transform: `translateY(${(1 - opacity) * 15}px)`,
          transition: "none",
        }}
      >
        {subline}
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function PhoneScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const lastFrameRef = useRef(-1);

  const { images, progress, isLoaded } = useImagePreloader();
  const { renderFrame } = useCanvasRenderer(canvasRef, images);

  // Framer Motion's built-in scroll tracker: measures containerRef directly
  // against the viewport on every frame (via IntersectionObserver + rAF), so
  // it isn't affected by which element happens to be the "scrolling
  // ancestor" — unlike a manual `window.addEventListener("scroll", ...)`
  // listener, which silently stops firing if an ancestor (e.g. <body>)
  // becomes its own scroll container.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress → frame index
  const frameIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, TOTAL_FRAMES - 1]
  );

  // Track progress for text overlays
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setCurrentProgress(value);
  });

  // Render frame on scroll
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoaded) return;
    const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(latest)));
    if (index !== lastFrameRef.current) {
      lastFrameRef.current = index;
      renderFrame(index);
    }
  });

  // Initial render when images are loaded
  useEffect(() => {
    if (isLoaded && images.length > 0) {
      renderFrame(0);
    }
  }, [isLoaded, images, renderFrame]);

  // Re-render current frame on resize
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      const index = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(frameIndex.get()))
      );
      renderFrame(index);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, frameIndex, renderFrame]);

  // Lock scroll while loading, unlock when ready
  useEffect(() => {
    if (!isLoaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoaded]);

  return (
    <>
      {/* Loading overlay — sits on top of everything, disappears when loaded */}
      {!isLoaded && <LoadingScreen progress={progress} />}

      {/* Scroll container — ALWAYS rendered so containerRef is hydrated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div ref={containerRef} className="relative h-[400vh]">
          {/* Sticky viewport */}
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
              style={{ background: "#0a0a0a" }}
            />

            {/* Vignette overlay for cinematic feel */}
            <div
              className="absolute inset-0 pointer-events-none z-[5]"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 50%, rgba(8,8,8,0.4) 100%)",
              }}
            />

            {/* Text overlays */}
            {TEXT_SECTIONS.map((section) => (
              <ScrollTextOverlay
                key={section.id}
                section={section}
                scrollProgress={currentProgress}
              />
            ))}

            {/* Scroll indicator (only at start) */}
            {currentProgress < 0.05 && (
              <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
                style={{
                  opacity: Math.max(0, 1 - currentProgress * 25),
                }}
              >
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-medium">
                  Scroll to explore
                </span>
                <div className="relative h-8 w-[1px]">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(196, 77, 123, 0.6), transparent)",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
