import type { ShareResult } from "@/types";

export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the older selection copy.
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function shareExperience(name: string): Promise<ShareResult> {
  const url = window.location.href;
  const text = `${name} ji ne Karwa Chauth Ki Kasam pass kar liya! Single ho? Fake husband ready hai. Pyaar bhi, roast bhi.`;
  const payload = {
    title: "Karwa Chauth Ki Kasam",
    text,
    url,
  };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  const copied = await copyText(`${text} ${url}`);
  return copied ? "copied" : "failed";
}
