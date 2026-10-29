import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
const rate = 22050;

function wav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(sample < 0 ? sample * 0x8000 : sample * 0x7fff, 44 + i * 2);
  }
  return buffer;
}

function silence(seconds) {
  return new Float32Array(Math.floor(rate * seconds));
}

function addTone(samples, freq, start, duration, amp, type = "sine") {
  const from = Math.floor(start * rate);
  const count = Math.floor(duration * rate);
  for (let i = 0; i < count; i += 1) {
    const index = from + i;
    if (index < 0 || index >= samples.length) continue;
    const t = i / rate;
    const env = Math.sin(Math.PI * Math.min(1, i / count)) ** 0.85;
    const cycle = (t * freq) % 1;
    let wave = Math.sin(cycle * Math.PI * 2);
    if (type === "triangle") wave = 2 * Math.abs(2 * cycle - 1) - 1;
    samples[index] += wave * amp * env;
  }
}

function loop() {
  const samples = silence(8);
  const notes = [329.63, 392, 440, 392, 329.63, 293.66, 329.63, 392, 440, 523.25, 440, 392, 349.23, 329.63, 293.66, 261.63];
  notes.forEach((freq, index) => {
    addTone(samples, freq, index * 0.5, 0.46, 0.16, "triangle");
    addTone(samples, freq / 2, index * 0.5, 0.46, 0.05, "sine");
  });
  return samples;
}

function click() {
  const samples = silence(0.12);
  addTone(samples, 740, 0, 0.09, 0.35, "sine");
  return samples;
}

function giggle() {
  const samples = silence(0.36);
  addTone(samples, 880, 0, 0.12, 0.28, "sine");
  addTone(samples, 1174, 0.12, 0.16, 0.24, "sine");
  return samples;
}

function celebrate() {
  const samples = silence(0.7);
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
    addTone(samples, freq, index * 0.12, 0.22, 0.22, "triangle");
  });
  return samples;
}

function shutter() {
  const samples = silence(0.16);
  for (let i = 0; i < samples.length; i += 1) {
    const env = 1 - i / samples.length;
    samples[i] = (Math.random() * 2 - 1) * 0.28 * env;
  }
  addTone(samples, 180, 0, 0.08, 0.2, "triangle");
  return samples;
}

mkdirSync(root, { recursive: true });
const files = {
  "background-loop.wav": loop(),
  "click.wav": click(),
  "giggle.wav": giggle(),
  "celebrate.wav": celebrate(),
  "shutter.wav": shutter(),
};

for (const [name, samples] of Object.entries(files)) {
  writeFileSync(join(root, name), wav(samples));
}

console.log(`Wrote ${Object.keys(files).length} original wav files to ${root}`);
