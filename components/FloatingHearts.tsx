const BITS = [
  { id: "h1", kind: "heart", left: "6%", top: "18%", size: 16, delay: "0s", duration: "9s" },
  { id: "h2", kind: "heart", left: "82%", top: "24%", size: 18, delay: "1.2s", duration: "11s" },
  { id: "h3", kind: "heart", left: "18%", top: "62%", size: 14, delay: "0.6s", duration: "10s" },
  { id: "h4", kind: "heart", left: "74%", top: "70%", size: 15, delay: "1.8s", duration: "12s" },
  { id: "s1", kind: "star", left: "28%", top: "12%", size: 10, delay: "0.4s", duration: "3.2s" },
  { id: "s2", kind: "star", left: "64%", top: "16%", size: 8, delay: "1.1s", duration: "2.6s" },
  { id: "s3", kind: "star", left: "48%", top: "78%", size: 9, delay: "0.2s", duration: "3s" },
  { id: "p1", kind: "petal", left: "12%", top: "40%", size: 12, delay: "0.8s", duration: "13s" },
  { id: "p2", kind: "petal", left: "88%", top: "46%", size: 14, delay: "1.5s", duration: "14s" },
  { id: "p3", kind: "petal", left: "40%", top: "30%", size: 11, delay: "2s", duration: "12s" },
] as const;

export function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BITS.map((bit) => (
        <span
          key={bit.id}
          className={bit.kind === "star" ? "twinkle absolute" : "float-y absolute"}
          style={{
            left: bit.left,
            top: bit.top,
            width: bit.size,
            height: bit.kind === "petal" ? bit.size * 1.4 : bit.size,
            animationDelay: bit.delay,
            animationDuration: bit.duration,
          }}
        >
          {bit.kind === "heart" ? (
            <svg viewBox="0 0 24 24" className="h-full w-full fill-pink/80">
              <path d="M12 21s-6.7-4.2-9.3-8.3C.4 9.4 1.5 5.6 4.8 4.8c2-.6 3.9.3 5.2 2.2C11.3 5.1 13.2 4.2 15.2 4.8c3.3.8 4.4 4.6 2.1 7.9C18.7 16.8 12 21 12 21z" />
            </svg>
          ) : null}
          {bit.kind === "star" ? (
            <svg viewBox="0 0 24 24" className="h-full w-full fill-saffron">
              <path d="M12 2.5 14.2 9H21l-5.4 4.1 2 6.4L12 15.8 6.4 19.5l2-6.4L3 9h6.8L12 2.5z" />
            </svg>
          ) : null}
          {bit.kind === "petal" ? (
            <span className="block h-full w-full rounded-full bg-pink/70" style={{ transform: "rotate(28deg)" }} />
          ) : null}
        </span>
      ))}
    </div>
  );
}
