"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ExperienceBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-[#3d0810] px-6 text-center text-[#fff5e6]">
          <div>
            <h1 className="font-display text-3xl">Arre, screen slip ho gayi</h1>
            <p className="mt-3">Refresh karo, phir se shuru. Koi login nahi chahiye.</p>
            <button
              type="button"
              className="mt-6 min-h-12 rounded-full bg-[#ffb347] px-6 font-extrabold text-[#3d0810]"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
