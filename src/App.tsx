import { Suspense, lazy, useEffect, useReducer, useState } from "react";
import { engine } from "./audio/engine";
import { FIRST_SCENE, SCENES, characterOf, type Flow } from "./data/scenes";
import { FLOW_POSES } from "./data/poses";
import { hasAsset, imageIfPresent, imgPath, preloadImage } from "./engine/assets";
import { writeStore } from "./engine/env";
import { appReducer, initialAppState } from "./engine/machine";
import { Clouds } from "./fx/Clouds";
import { GradeOverlay } from "./fx/GradeOverlay";
import { Moon } from "./fx/Moon";
import { SkyCanvas } from "./fx/SkyCanvas";
import { EnterScreen, Gate } from "./scenes/Gate";
import { NameStep } from "./scenes/NameStep";
import { Banner, RotateHint } from "./ui/Banner";
import { Loader } from "./ui/Loader";

const loadStage = () => import("./scenes/Stage");
const Stage = lazy(loadStage);

/** Preloads only the chosen flow's media; the other flow loads if the player switches. */
async function preloadFlow(flow: Flow, onProgress: (value: number) => void) {
  const images = [...FLOW_POSES[characterOf(flow)], "bg-terrace-night", "moon", "prop-glass", "prop-chalni"]
    .map(imgPath)
    .filter(hasAsset);
  const first = SCENES[FIRST_SCENE[flow]];
  const tasks: Promise<unknown>[] = [
    loadStage(),
    engine.loadDurations(),
    ...images.map(preloadImage),
  ];
  first.lines.intro.forEach((id) => engine.preloadLine(id));
  let done = 0;
  const total = tasks.length;
  const tracked = tasks.map((task) =>
    task
      .catch(() => undefined)
      .then(() => {
        done += 1;
        onProgress(done / total);
      }),
  );
  await Promise.all([...tracked, new Promise((resolve) => window.setTimeout(resolve, 900))]);
}

function Backdrop() {
  const photo = imageIfPresent("bg-terrace-night");
  return (
    <div className="backdrop" aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : <div className="backdrop-glow" />}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, initialAppState);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.phase !== "loading" || !state.flow) return;
    let alive = true;
    setProgress(0);
    void preloadFlow(state.flow, (value) => alive && setProgress(value)).then(() => {
      if (alive) dispatch({ type: "loaded" });
    });
    return () => {
      alive = false;
    };
  }, [state.phase, state.flow]);

  // The gate tap is the user gesture that unlocks Web Audio and speech.
  const unlockAudio = () => {
    engine.unlock();
    engine.startAmbient();
    engine.sfx("wind-chime", 0.8);
  };

  return (
    <div className="app">
      <Backdrop />
      <main className="stage" aria-label="Karva Chauth Moon Night">
        <div className="layer nebula" aria-hidden="true" />
        <SkyCanvas dense={state.moon === "large"} />
        <Moon state={state.phase === "stage" ? state.moon : "hidden"} />
        <Clouds state={state.phase === "stage" ? state.clouds : "thick"} />

        {state.phase === "gate" ? (
          <Gate
            onPick={(flow) => {
              unlockAudio();
              dispatch({ type: "pick", flow });
            }}
          />
        ) : null}

        {state.phase === "enter" && state.flow ? (
          <EnterScreen
            name={state.name}
            flow={state.flow}
            onEnter={() => {
              unlockAudio();
              dispatch({ type: "enter" });
            }}
          />
        ) : null}

        {state.phase === "name" ? <NameStep onDone={(name) => dispatch({ type: "named", name })} /> : null}

        {state.phase === "loading" ? <Loader progress={progress} /> : null}

        {state.phase !== "stage" ? <GradeOverlay /> : null}

        {state.phase === "stage" && state.flow && state.startScene ? (
          <Suspense fallback={<Loader progress={1} />}>
            <Stage
              key={`${state.flow}-${state.run}`}
              flow={state.flow}
              name={state.name}
              startScene={state.startScene}
              lang={state.lang}
              onLang={(lang) => {
                writeStore("local", "kc-lang", lang);
                dispatch({ type: "lang", lang });
              }}
              onSky={(moon, clouds) => dispatch({ type: "sky", moon, clouds })}
              onReplay={() => dispatch({ type: "replay" })}
              onSwitch={() => dispatch({ type: "switch" })}
            />
          </Suspense>
        ) : null}

        <Banner />
      </main>
      <RotateHint />
    </div>
  );
}
