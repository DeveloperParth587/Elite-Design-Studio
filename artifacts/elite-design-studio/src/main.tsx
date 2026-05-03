import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

// Hide Clerk "Development mode" badge.
// Clerk renders it via a remote CDN script after hydration, so we use a
// MutationObserver to catch it whenever it appears in the DOM.
function hideDevModeBadge() {
  // Target by stable data-localization-key attribute
  document.querySelectorAll<HTMLElement>('[data-localization-key="badge__devMode"]').forEach((el) => {
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
  // Fallback: hide any anchor whose trimmed text is exactly "Development mode"
  document.querySelectorAll<HTMLAnchorElement>("a").forEach((el) => {
    if (el.textContent?.trim() === "Development mode") {
      el.style.setProperty("display", "none", "important");
      if (el.parentElement) el.parentElement.style.setProperty("display", "none", "important");
    }
  });
}

const devModeObserver = new MutationObserver(hideDevModeBadge);
devModeObserver.observe(document.body, { childList: true, subtree: true });

createRoot(document.getElementById("root")!).render(<App />);
