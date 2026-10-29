"use client";

const PIECES = [
  { id: "c1", left: "8%", color: "#FFB347", delay: "0s", duration: "2.8s" },
  { id: "c2", left: "18%", color: "#FF6B9D", delay: "0.2s", duration: "3.2s" },
  { id: "c3", left: "28%", color: "#FFF5E6", delay: "0.05s", duration: "2.6s" },
  { id: "c4", left: "40%", color: "#FFB347", delay: "0.35s", duration: "3.4s" },
  { id: "c5", left: "52%", color: "#FF6B9D", delay: "0.1s", duration: "2.9s" },
  { id: "c6", left: "63%", color: "#FFF6D8", delay: "0.28s", duration: "3.1s" },
  { id: "c7", left: "74%", color: "#FFB347", delay: "0.16s", duration: "2.7s" },
  { id: "c8", left: "86%", color: "#FF6B9D", delay: "0.4s", duration: "3.3s" },
  { id: "c9", left: "12%", color: "#FFF5E6", delay: "0.5s", duration: "3s" },
  { id: "c10", left: "33%", color: "#FF8FB8", delay: "0.22s", duration: "3.5s" },
  { id: "c11", left: "58%", color: "#FFB347", delay: "0.45s", duration: "2.8s" },
  { id: "c12", left: "92%", color: "#FFF5E6", delay: "0.12s", duration: "3.2s" },
] as const;

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}
