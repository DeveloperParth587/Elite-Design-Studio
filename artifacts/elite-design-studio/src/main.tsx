import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

// Hide Clerk badges (dev mode, deployment notices, etc.)
// Clerk renders these via a remote CDN script after hydration, so we use a
// MutationObserver to catch them whenever they appear in the DOM.
function hideBadges() {
  // Target by data-localization-key attribute
  document.querySelectorAll<HTMLElement>('[data-localization-key^="badge__"]').forEach((el) => {
    el.style.setProperty("display", "none", "important");
    // Also hide the wrapping container so no empty space remains
    let p = el.parentElement;
    while (p && p !== document.body) {
      if (p.childElementCount === 1) {
        p.style.setProperty("display", "none", "important");
        p = p.parentElement;
      } else break;
    }
  });
  // Fallback: hide any text that matches known badge labels
  document.querySelectorAll<HTMLAnchorElement>("a").forEach((el) => {
    const text = el.textContent?.trim() || "";
    if (
      text === "Development mode" ||
      text === "Deployment" ||
      text.toLowerCase().includes("deployment") ||
      text.toLowerCase().includes("development mode")
    ) {
      el.style.setProperty("display", "none", "important");
      if (el.parentElement) el.parentElement.style.setProperty("display", "none", "important");
    }
  });
}

const badgeObserver = new MutationObserver(hideBadges);
badgeObserver.observe(document.body, { childList: true, subtree: true });

createRoot(document.getElementById("root")!).render(<App />);
