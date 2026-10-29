import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { engine, type LineHandle, type SfxName } from "../audio/engine";
import type { Lang } from "../audio/subtitles";
import { SCENES, characterOf, type CloudState, type Flow, type MoonState, type SceneId } from "../data/scenes";
import { line } from "../data/script";
import { vibrate } from "../engine/env";
import { sceneInit, sceneReducer } from "../engine/machine";
import { Foreground } from "../fx/Foreground";
import { GradeOverlay } from "../fx/GradeOverlay";
import { getQuality, subscribeQuality } from "../fx/quality";
import { AartiCircles } from "../interactions/AartiCircles";
import { ChalniDrag } from "../interactions/ChalniDrag";
import { ChalniLook } from "../interactions/ChalniLook";
import { CloudWipe } from "../interactions/CloudWipe";
import { HeartbeatHold } from "../interactions/HeartbeatHold";
import { SipHold } from "../interactions/SipHold";
import type { InteractionProps } from "../interactions/types";
import { WishTaps } from "../interactions/WishTaps";
import { Controls } from "../ui/Controls";
import { SubtitleCard } from "../ui/SubtitleCard";
import { Character } from "./Character";
import { Finale } from "./Finale";
import { Terrace } from "./Terrace";

interface StageProps {
  flow: Flow;
  name: string;
  startScene: SceneId;
  lang: Lang;
  onLang(lang: Lang): void;
  onSky(moon: MoonState, clouds: CloudState): void;
  onReplay(): void;
  onSwitch(): void;
}

const useReduced = () => useSyncExternalStore(subscribeQuality, () => getQuality() === "reduced");

function speakerLabel(who: "her" | "him", lang: Lang, name: string) {
  if (lang === "en") return name ? `${who === "her" ? "She" : "He"} says · to ${name}` : who === "her" ? "She says" : "He says";
  const says = who === "her" ? "Woh kehti hai" : "Woh kehta hai";
  return name ? `${name} ke liye · ${says}` : says;
}

export default function Stage({ flow, name, startScene, lang, onLang, onSky, onReplay, onSwitch }: StageProps) {
  const [state, dispatch] = useReducer(sceneReducer, startScene, sceneInit);
  const scene = SCENES[state.sceneId];
  const who = characterOf(flow);
  const reduced = useReduced();
  const muted = useSyncExternalStore(
    (listener) => engine.subscribe(listener),
    () => engine.muted,
  );
  const speaking = useSyncExternalStore(
    (listener) => engine.subscribe(listener),
    () => engine.isSpeaking(),
  );

  const [handle, setHandle] = useState<LineHandle | null>(null);
  const [lastLine, setLastLine] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [flash, setFlash] = useState(0);
  const [escape, setEscape] = useState(false);

  const completeRef = useRef<(() => void) | null>(null);
  const skipWaitRef = useRef<(() => void) | null>(null);
  const lastActivity = useRef(performance.now());
  const nudged = useRef(false);
  const earlyAt = useRef(0);
  const completedRef = useRef(false);
  const duringPlayed = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const skySetter = useRef(onSky);
  skySetter.current = onSky;

  const say = useCallback((id: string) => {
    const next = engine.playLine(line(id));
    setHandle(next);
    setLastLine(id);
    return next;
  }, []);

  const sfx = useCallback((nameOfSfx: SfxName, volume?: number) => engine.sfx(nameOfSfx, volume), []);

  /* The scene runner: intro lines → interaction → after lines → next scene. */
  useEffect(() => {
    const token = { cancelled: false };
    const current = SCENES[state.sceneId];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        skipWaitRef.current = () => {
          window.clearTimeout(timer);
          resolve();
        };
      });

    const goNext = () => {
      const nextId = current.next;
      if (!nextId || token.cancelled) return;
      setFlash((n) => n + 1);
      engine.sfx("whoosh", 0.35);
      window.setTimeout(() => {
        if (!token.cancelled) dispatch({ type: "enter", sceneId: nextId });
      }, 300);
    };

    const sayAll = async (ids: string[]) => {
      for (const id of ids) {
        if (token.cancelled) return;
        await say(id).done;
        if (token.cancelled) return;
        await sleep(260);
      }
    };

    const run = async () => {
      completedRef.current = false;
      nudged.current = false;
      duringPlayed.current = false;
      setEscape(false);
      setShowTitle(true);
      skySetter.current(current.moon, current.interaction === "cloud-wipe" ? "none" : current.clouds);

      [...current.lines.intro, ...current.lines.after].forEach((id) => engine.preloadLine(id));
      if (current.lines.nudge) engine.preloadLine(current.lines.nudge);
      if (current.lines.early) engine.preloadLine(current.lines.early);
      if (current.next) SCENES[current.next].lines.intro.forEach((id) => engine.preloadLine(id));

      await sleep(1000);
      if (token.cancelled) return;
      setShowTitle(false);
      await sayAll(current.lines.intro);
      if (token.cancelled) return;

      if (current.interaction === "none") {
        dispatch({ type: "step", step: "wait" });
        await sleep(1200);
        goNext();
        return;
      }

      dispatch({ type: "step", step: "interact" });
      lastActivity.current = performance.now();
      await new Promise<void>((resolve) => {
        completeRef.current = resolve;
      });
      completeRef.current = null;
      if (token.cancelled) return;

      completedRef.current = true;
      dispatch({ type: "complete" });

      if (current.interaction === "wish-taps") {
        dispatch({ type: "finale" });
        return;
      }
      if (current.interaction === "cloud-wipe") {
        skySetter.current("up", "thin");
        vibrate(30);
        engine.sfx("bell", 0.55);
      }

      dispatch({ type: "step", step: "outro" });
      await sleep(current.interaction === "cloud-wipe" ? 1600 : 500);
      await sayAll(current.lines.after);
      if (token.cancelled) return;
      dispatch({ type: "step", step: "wait" });
      await sleep(1200);
      goNext();
    };

    void run();
    return () => {
      token.cancelled = true;
      completeRef.current?.();
      skipWaitRef.current?.();
      engine.stopLine();
    };
  }, [state.sceneId, say]);

  /* Idle nudges and the escape hatch while waiting for an interaction. */
  useEffect(() => {
    if (state.step !== "interact") return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!nudged.current && !engine.isSpeaking()) {
        const limit = scene.lines.nudge ? 6000 : 8000;
        if (now - lastActivity.current > limit) {
          nudged.current = true;
          say(scene.lines.nudge ?? `${who}_n1`);
        }
      }
      if (now - started > 15000) setEscape(true);
    }, 500);
    return () => window.clearInterval(timer);
  }, [state.step, scene, who, say]);

  /* Pointer / tilt parallax: background and character move apart by up to 12 px. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      tx = Math.max(-1, Math.min(1, event.gamma / 25));
      ty = Math.max(-1, Math.min(1, (event.beta - 45) / 25));
    };
    const loop = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduced]);

  const onSkip = () => {
    if (state.step === "interact") {
      completeRef.current?.();
      return;
    }
    if (engine.isSpeaking()) engine.stopLine();
    else skipWaitRef.current?.();
  };

  const interactionProps: InteractionProps = {
    active: state.step === "interact",
    completed: state.completed,
    reduced,
    sfx,
    onActivity: () => {
      lastActivity.current = performance.now();
    },
    onComplete: () => completeRef.current?.(),
    onHoldChange: (holding) => {
      if (scene.poseDuring && !completedRef.current) {
        dispatch({ type: "pose", pose: holding ? scene.poseDuring : scene.pose });
      }
      if (holding && !duringPlayed.current && scene.lines.during?.[0]) {
        duringPlayed.current = true;
        say(scene.lines.during[0]);
      }
    },
    onEarly: () => {
      const now = performance.now();
      if (scene.lines.early && !engine.isSpeaking() && now - earlyAt.current > 2500) {
        earlyAt.current = now;
        say(scene.lines.early);
      }
    },
  };

  const interaction = (() => {
    switch (scene.interaction) {
      case "cloud-wipe":
        return <CloudWipe {...interactionProps} />;
      case "chalni-look":
        return <ChalniLook {...interactionProps} />;
      case "aarti-circles":
        return <AartiCircles {...interactionProps} />;
      case "sip-give":
        return <SipHold {...interactionProps} variant="give" />;
      case "sip-drink":
        return <SipHold {...interactionProps} variant="drink" />;
      case "chalni-drag":
        return <ChalniDrag {...interactionProps} />;
      case "heartbeat-hold":
        return <HeartbeatHold {...interactionProps} />;
      case "wish-taps":
        return <WishTaps {...interactionProps} />;
      default:
        return null;
    }
  })();

  const showSkip =
    !state.finale &&
    (state.step === "intro" || state.step === "outro" || state.step === "wait" || (state.step === "interact" && escape));
  const hint = state.step === "interact" && !state.completed ? scene.hint ?? null : null;
  const characterLabel =
    who === "her"
      ? "Woh, lal-maroon saree mein, chhat par Karva Chauth ki pooja ke saath"
      : "Woh, ivory kurte mein, haath mein paani ka glass liye";

  return (
    <div ref={rootRef} className="stage-content">
      <Terrace />
      <Character pose={state.pose} label={characterLabel} />
      <Foreground petals={scene.interaction !== "cloud-wipe"} />

      <AnimatePresence mode="wait">
        <motion.div
          key={state.sceneId}
          className={`layer interaction-layer ${scene.interaction === "cloud-wipe" ? "is-sky" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {interaction}
        </motion.div>
      </AnimatePresence>

      <GradeOverlay />

      {!reduced && flash > 0 ? <div key={flash} className="light-leak" aria-hidden="true" /> : null}

      <div className="layer ui">
        <div className="top-bar">
          <p className={`chapter ${showTitle ? "is-visible" : ""}`} aria-live="polite">
            {scene.title}
          </p>
          <Controls
            muted={muted}
            lang={lang}
            canReplay={!speaking && !!lastLine && (state.step === "interact" || state.step === "done")}
            onMute={() => engine.setMuted(!muted)}
            onLang={onLang}
            onReplay={() => lastLine && say(lastLine)}
          />
        </div>

        {!state.finale ? <SubtitleCard handle={handle} lang={lang} speakerLabel={speakerLabel(who, lang, name)} hint={hint} /> : null}

        {showSkip ? (
          <button type="button" className="skip-chevron" onClick={onSkip} aria-label="Aage">
            <span>Aage</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        ) : null}
      </div>

      {state.finale ? <Finale flow={flow} name={name} onReplay={onReplay} onSwitch={onSwitch} /> : null}
    </div>
  );
}
