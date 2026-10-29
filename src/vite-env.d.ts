/// <reference types="vite/client" />

declare module "virtual:asset-manifest" {
  const files: string[];
  export default files;
}

interface Navigator {
  audioSession?: { type: string };
}

interface Window {
  webkitAudioContext?: typeof AudioContext;
}
