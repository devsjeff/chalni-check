/** Layer 7: vignette, warm/cool split tone and 4 % film grain. */
export function GradeOverlay() {
  return (
    <div className="layer grade" aria-hidden="true">
      <div className="grade-split" />
      <div className="grade-vignette" />
      <div className="grade-grain" />
    </div>
  );
}
