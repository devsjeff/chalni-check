import type { Speaker } from "./script";

export type PoseId =
  | "her-01-waiting"
  | "her-02-chalni-moon"
  | "her-03-chalni-you"
  | "her-04-aarti"
  | "her-05-happy"
  | "her-06-sip"
  | "him-01-waiting"
  | "him-02-moon"
  | "him-03-offer"
  | "him-04-shy"
  | "him-05-promise";

/** What the placeholder silhouette holds until the real photo exists. */
export type PlaceholderProp =
  | "thali"
  | "chalni-up"
  | "chalni-face"
  | "thali-out"
  | "hand-smile"
  | "sip"
  | "glass"
  | "glass-up"
  | "glass-offer"
  | "hand-neck"
  | "hand-heart";

export interface PoseDef {
  id: PoseId;
  who: Speaker;
  prop: PlaceholderProp;
  /** Head tilt for the placeholder, degrees. */
  tilt: number;
}

export const POSES: Record<PoseId, PoseDef> = {
  "her-01-waiting": { id: "her-01-waiting", who: "her", prop: "thali", tilt: -6 },
  "her-02-chalni-moon": { id: "her-02-chalni-moon", who: "her", prop: "chalni-up", tilt: -10 },
  "her-03-chalni-you": { id: "her-03-chalni-you", who: "her", prop: "chalni-face", tilt: 3 },
  "her-04-aarti": { id: "her-04-aarti", who: "her", prop: "thali-out", tilt: 2 },
  "her-05-happy": { id: "her-05-happy", who: "her", prop: "hand-smile", tilt: 5 },
  "her-06-sip": { id: "her-06-sip", who: "her", prop: "sip", tilt: -4 },
  "him-01-waiting": { id: "him-01-waiting", who: "him", prop: "glass", tilt: -4 },
  "him-02-moon": { id: "him-02-moon", who: "him", prop: "glass-up", tilt: -11 },
  "him-03-offer": { id: "him-03-offer", who: "him", prop: "glass-offer", tilt: 4 },
  "him-04-shy": { id: "him-04-shy", who: "him", prop: "hand-neck", tilt: 7 },
  "him-05-promise": { id: "him-05-promise", who: "him", prop: "hand-heart", tilt: 0 },
};

export const FLOW_POSES: Record<Speaker, PoseId[]> = {
  her: ["her-01-waiting", "her-02-chalni-moon", "her-03-chalni-you", "her-04-aarti", "her-05-happy", "her-06-sip"],
  him: ["him-01-waiting", "him-02-moon", "him-03-offer", "him-04-shy", "him-05-promise"],
};
