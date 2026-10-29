import type { PoseId } from "./poses";

export type Flow = "boy" | "girl";

export type SceneId = "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6";

export type InteractionKind =
  | "none"
  | "cloud-wipe"
  | "chalni-look"
  | "aarti-circles"
  | "sip-give"
  | "chalni-drag"
  | "sip-drink"
  | "heartbeat-hold"
  | "wish-taps";

export type MoonState = "hidden" | "up" | "large";
export type CloudState = "thick" | "thin" | "none";

export interface SceneDef {
  id: SceneId;
  flow: Flow;
  /** Small chapter title shown as the scene opens. */
  title: string;
  pose: PoseId;
  /** Pose after the interaction completes. */
  poseAfter?: PoseId;
  /** Pose while the player is holding (sip scenes). */
  poseDuring?: PoseId;
  bg: "bg-terrace-night";
  ambient: "ambient";
  lines: {
    intro: string[];
    after: string[];
    /** Played once after 6 s idle; otherwise the generic n1 nudge plays after 8 s. */
    nudge?: string;
    /** Played once when the player starts holding (B3: look through the chalni). */
    during?: string[];
    /** Played when a hold is released too early. */
    early?: string;
  };
  interaction: InteractionKind;
  hint?: string;
  moon: MoonState;
  clouds: CloudState;
  next: SceneId | null;
}

const base = { bg: "bg-terrace-night", ambient: "ambient" } as const;

export const SCENES: Record<SceneId, SceneDef> = {
  B1: {
    ...base,
    id: "B1",
    flow: "boy",
    title: "Intezaar",
    pose: "her-01-waiting",
    lines: { intro: ["her_01", "her_02"], after: [] },
    interaction: "none",
    moon: "hidden",
    clouds: "thick",
    next: "B2",
  },
  B2: {
    ...base,
    id: "B2",
    flow: "boy",
    title: "Baadal hatao",
    pose: "her-01-waiting",
    poseAfter: "her-05-happy",
    lines: { intro: ["her_03"], after: ["her_04"], nudge: "her_n2" },
    interaction: "cloud-wipe",
    hint: "Ungli se baadal hatao",
    moon: "hidden",
    clouds: "thick",
    next: "B3",
  },
  B3: {
    ...base,
    id: "B3",
    flow: "boy",
    title: "Chalni se chaand",
    pose: "her-02-chalni-moon",
    poseDuring: "her-03-chalni-you",
    poseAfter: "her-03-chalni-you",
    lines: { intro: ["her_05"], after: [], during: ["her_06"] },
    interaction: "chalni-look",
    hint: "Dabaye rakho, chalni se dekho",
    moon: "up",
    clouds: "thin",
    next: "B4",
  },
  B4: {
    ...base,
    id: "B4",
    flow: "boy",
    title: "Aarti aur tilak",
    pose: "her-04-aarti",
    lines: { intro: ["her_07"], after: ["her_08", "her_09"] },
    interaction: "aarti-circles",
    hint: "Ungli se gol-gol ghumao",
    moon: "up",
    clouds: "thin",
    next: "B5",
  },
  B5: {
    ...base,
    id: "B5",
    flow: "boy",
    title: "Pani pilao",
    pose: "her-04-aarti",
    poseDuring: "her-06-sip",
    poseAfter: "her-06-sip",
    lines: { intro: ["her_10"], after: ["her_11"], early: "her_n3" },
    interaction: "sip-give",
    hint: "Glass ko dabaye rakho",
    moon: "up",
    clouds: "thin",
    next: "B6",
  },
  B6: {
    ...base,
    id: "B6",
    flow: "boy",
    title: "Ek wish",
    pose: "her-05-happy",
    lines: { intro: ["her_12"], after: [] },
    interaction: "wish-taps",
    hint: "Aasmaan par tap karo, ek wish bhejo",
    moon: "large",
    clouds: "none",
    next: null,
  },

  G1: {
    ...base,
    id: "G1",
    flow: "girl",
    title: "Intezaar",
    pose: "him-01-waiting",
    lines: { intro: ["him_01", "him_02"], after: [] },
    interaction: "none",
    moon: "hidden",
    clouds: "thick",
    next: "G2",
  },
  G2: {
    ...base,
    id: "G2",
    flow: "girl",
    title: "Baadal hatao",
    pose: "him-01-waiting",
    poseAfter: "him-02-moon",
    lines: { intro: ["him_03"], after: ["him_04"], nudge: "him_n2" },
    interaction: "cloud-wipe",
    hint: "Ungli se baadal hatao",
    moon: "hidden",
    clouds: "thick",
    next: "G3",
  },
  G3: {
    ...base,
    id: "G3",
    flow: "girl",
    title: "Chalni",
    pose: "him-02-moon",
    poseAfter: "him-04-shy",
    lines: { intro: ["him_05"], after: ["him_06"] },
    interaction: "chalni-drag",
    hint: "Chalni ko chaand tak le jao, phir neeche",
    moon: "up",
    clouds: "thin",
    next: "G4",
  },
  G4: {
    ...base,
    id: "G4",
    flow: "girl",
    title: "Pani",
    pose: "him-03-offer",
    lines: { intro: ["him_07"], after: ["him_08"], early: "him_n3" },
    interaction: "sip-drink",
    hint: "Glass ko dabaye rakho",
    moon: "up",
    clouds: "thin",
    next: "G5",
  },
  G5: {
    ...base,
    id: "G5",
    flow: "girl",
    title: "Dil ki dhadkan",
    pose: "him-05-promise",
    lines: { intro: ["him_09"], after: ["him_10"] },
    interaction: "heartbeat-hold",
    hint: "Dabaye rakho, dhadkan suno",
    moon: "up",
    clouds: "thin",
    next: "G6",
  },
  G6: {
    ...base,
    id: "G6",
    flow: "girl",
    title: "Ek wish",
    pose: "him-05-promise",
    lines: { intro: ["him_11"], after: [] },
    interaction: "wish-taps",
    hint: "Aasmaan par tap karo, ek wish bhejo",
    moon: "large",
    clouds: "none",
    next: null,
  },
};

export const FIRST_SCENE: Record<Flow, SceneId> = { boy: "B1", girl: "G1" };

export const characterOf = (flow: Flow) => (flow === "boy" ? "her" : "him");

export const closingLineId = (flow: Flow) => (flow === "boy" ? "her_12" : "him_11");

export function isSceneId(value: string | null): value is SceneId {
  return !!value && value in SCENES;
}
