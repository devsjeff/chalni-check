"""Generate every spoken line with free Microsoft neural voices.

Usage:
    pip install edge-tts mutagen
    python scripts/gen_voice.py            # only missing files
    python scripts/gen_voice.py --force    # regenerate everything

Reads src/data/script.json, writes public/audio/voice/{id}.mp3 and
public/audio/voice/durations.json (seconds per line).
"""

import asyncio
import json
import sys
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "data" / "script.json"
OUT = ROOT / "public" / "audio" / "voice"

VOICES = {"her": "hi-IN-SwaraNeural", "him": "hi-IN-MadhurNeural"}
RATE = "-8%"
# edge-tts streams 24 kHz mono MP3 at 48 kbps, under the 64 kbps budget.


async def render(line: dict, force: bool) -> None:
    target = OUT / f"{line['id']}.mp3"
    if target.exists() and target.stat().st_size > 0 and not force:
        print(f"skip  {line['id']}")
        return
    communicate = edge_tts.Communicate(line["hindi"], VOICES[line["speaker"]], rate=RATE)
    await communicate.save(str(target))
    print(f"wrote {line['id']}")


async def main() -> None:
    force = "--force" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    lines = json.loads(SCRIPT.read_text(encoding="utf-8"))

    for line in lines:
        for attempt in range(3):
            try:
                await render(line, force)
                break
            except Exception as error:  # network hiccups happen; retry a couple of times
                print(f"retry {line['id']} ({attempt + 1}): {error}")
                await asyncio.sleep(1.5)

    durations = {}
    for line in lines:
        path = OUT / f"{line['id']}.mp3"
        if path.exists() and path.stat().st_size > 0:
            durations[line["id"]] = round(MP3(str(path)).info.length, 3)

    (OUT / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
    print(f"durations.json: {len(durations)}/{len(lines)} lines")


if __name__ == "__main__":
    asyncio.run(main())
