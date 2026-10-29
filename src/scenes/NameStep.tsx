import { useState, type FormEvent } from "react";
import { sanitizeName } from "../engine/env";

export function NameStep({ onDone }: { onDone(name: string): void }) {
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onDone(sanitizeName(value));
  };

  return (
    <section className="screen name-step" aria-labelledby="name-title">
      <form onSubmit={submit} className="name-form">
        <label id="name-title" htmlFor="player-name" className="name-label">
          Tumhara naam? <span className="name-optional">(optional)</span>
        </label>
        <input
          id="player-name"
          className="name-input"
          value={value}
          maxLength={20}
          autoComplete="given-name"
          enterKeyHint="go"
          placeholder="Jaise Riya ya Aarav"
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="name-help">Sirf subtitles aur aakhri card par dikhega. Kahin save nahi hota.</p>
        <button type="submit" className="primary-button">
          Chhat par chalo
        </button>
        <button type="button" className="text-button" onClick={() => onDone("")}>
          Skip karo
        </button>
      </form>
    </section>
  );
}
