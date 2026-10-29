export type Scene =
  | "welcome"
  | "name"
  | "husband"
  | "roast"
  | "camera"
  | "finale";

export type RelationshipStatus =
  | "single"
  | "complicated"
  | "situationship"
  | "taken";

export type GirlMood =
  | "wave"
  | "talk"
  | "laugh"
  | "think"
  | "celebrate"
  | "wink"
  | "shock"
  | "smug";

export type SfxName = "click" | "giggle" | "celebrate" | "shutter";

export type CameraFailure =
  | "denied"
  | "missing"
  | "insecure"
  | "unsupported"
  | "busy"
  | "unknown";

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";
