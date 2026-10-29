import type { SfxName } from "../audio/engine";

export interface InteractionProps {
  /** True while the scene is waiting for this interaction. */
  active: boolean;
  /** True once completed; components keep their end state on screen. */
  completed: boolean;
  reduced: boolean;
  onActivity(): void;
  onComplete(): void;
  onHoldChange?(holding: boolean): void;
  onEarly?(): void;
  sfx(name: SfxName, volume?: number): void;
}

/** Pointer position relative to an element, in CSS pixels. */
export function localPoint(event: { clientX: number; clientY: number }, el: Element) {
  const rect = el.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top, w: rect.width, h: rect.height };
}

export const isActivateKey = (event: { key: string }) => event.key === " " || event.key === "Enter";
