import { LANG_LABEL, LANG_SHORT, LANGS, type Lang } from "../audio/subtitles";

function IconSound({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="M17 9l5 6M22 9l-5 6" />
      ) : (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}

function IconReplay() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  );
}

interface Props {
  muted: boolean;
  lang: Lang;
  canReplay: boolean;
  onMute(): void;
  onLang(lang: Lang): void;
  onReplay(): void;
}

export function Controls({ muted, lang, canReplay, onMute, onLang, onReplay }: Props) {
  const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length] ?? "hinglish";
  return (
    <div className="controls">
      <button
        type="button"
        className="ctrl"
        onClick={() => onLang(next)}
        aria-label={`Subtitles: ${LANG_LABEL[lang]}. ${LANG_LABEL[next]} par badlo`}
      >
        <span className={lang === "hindi" ? "font-hindi" : ""}>{LANG_SHORT[lang]}</span>
      </button>
      <button type="button" className="ctrl" onClick={onReplay} disabled={!canReplay} aria-label="Pichhli line dobara suno">
        <IconReplay />
      </button>
      <button type="button" className="ctrl" onClick={onMute} aria-pressed={muted} aria-label={muted ? "Awaaz chalu karo" : "Awaaz band karo"}>
        <IconSound muted={muted} />
      </button>
    </div>
  );
}
