import type { Lang } from "../audio/subtitles";
import type { PoseId } from "../data/poses";
import { FIRST_SCENE, SCENES, isSceneId, type CloudState, type Flow, type MoonState, type SceneId } from "../data/scenes";
import { params, readStore, sanitizeName } from "./env";

/* ---------- App-level machine: gate → name → loading → stage ---------- */

export type Phase = "gate" | "enter" | "name" | "loading" | "stage";

export interface AppState {
  phase: Phase;
  flow: Flow | null;
  name: string;
  startScene: SceneId | null;
  run: number;
  lang: Lang;
  moon: MoonState;
  clouds: CloudState;
}

export type AppAction =
  | { type: "pick"; flow: Flow }
  | { type: "enter" }
  | { type: "named"; name: string }
  | { type: "loaded" }
  | { type: "replay" }
  | { type: "switch" }
  | { type: "sky"; moon: MoonState; clouds: CloudState }
  | { type: "lang"; lang: Lang };

export function initialAppState(): AppState {
  const savedLang = readStore("local", "kc-lang");
  const lang: Lang = savedLang === "hindi" || savedLang === "en" ? savedLang : "hinglish";
  const base: AppState = {
    phase: "gate",
    flow: null,
    name: "",
    startScene: null,
    run: 0,
    lang,
    moon: "hidden",
    clouds: "thick",
  };

  const as = params.get("as");
  const name = sanitizeName(params.get("name"));
  const debugScene = params.get("debug") === "1" ? params.get("scene") : null;

  if (isSceneId(debugScene)) {
    const flow = SCENES[debugScene].flow;
    return { ...base, phase: "enter", flow, name, startScene: debugScene };
  }
  if (as === "boy" || as === "girl") {
    return { ...base, phase: "enter", flow: as, name, startScene: FIRST_SCENE[as] };
  }
  return base;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "pick":
      return { ...state, phase: "name", flow: action.flow, startScene: FIRST_SCENE[action.flow] };
    case "enter":
      return { ...state, phase: "loading" };
    case "named":
      return { ...state, phase: "loading", name: action.name };
    case "loaded":
      return { ...state, phase: "stage" };
    case "replay":
      if (!state.flow) return state;
      return { ...state, phase: "stage", startScene: FIRST_SCENE[state.flow], run: state.run + 1, moon: "hidden", clouds: "thick" };
    case "switch": {
      const flow: Flow = state.flow === "boy" ? "girl" : "boy";
      return { ...state, phase: "loading", flow, startScene: FIRST_SCENE[flow], run: state.run + 1, moon: "hidden", clouds: "thick" };
    }
    case "sky":
      return { ...state, moon: action.moon, clouds: action.clouds };
    case "lang":
      return { ...state, lang: action.lang };
  }
}

/* ---------- Scene runner machine: intro → interact → outro → wait ---------- */

export type Step = "intro" | "interact" | "outro" | "wait" | "done";

export interface SceneState {
  sceneId: SceneId;
  step: Step;
  pose: PoseId;
  completed: boolean;
  finale: boolean;
}

export type SceneAction =
  | { type: "enter"; sceneId: SceneId }
  | { type: "step"; step: Step }
  | { type: "pose"; pose: PoseId }
  | { type: "complete" }
  | { type: "finale" };

export function sceneInit(sceneId: SceneId): SceneState {
  return { sceneId, step: "intro", pose: SCENES[sceneId].pose, completed: false, finale: false };
}

export function sceneReducer(state: SceneState, action: SceneAction): SceneState {
  switch (action.type) {
    case "enter":
      return sceneInit(action.sceneId);
    case "step":
      return { ...state, step: action.step };
    case "pose":
      return state.completed ? state : { ...state, pose: action.pose };
    case "complete": {
      const scene = SCENES[state.sceneId];
      return { ...state, completed: true, pose: scene.poseAfter ?? state.pose };
    }
    case "finale":
      return { ...state, step: "done", finale: true };
  }
}
