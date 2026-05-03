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
  
  // Hide any element containing badge-related localization keys
  document.querySelectorAll<HTMLElement>('[data-localization-key*="badge"], [data-localization-key*="deployment"], [data-localization-key*="devMode"]').forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
  
  // Fallback: hide any element whose text matches known badge labels
  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const text = el.textContent?.trim() || "";
    // Only target elements with small text content (likely badges/labels)
    if (text.length < 50 && (
      text === "Development mode" ||
      text === "Deployment" ||
      text.toLowerCase().includes("development mode") ||
      (text.toLowerCase().includes("deployment") && !text.toLowerCase().includes("deployment"))
    )) {
      el.style.setProperty("display", "none", "important");
    }
  });
  
  // Also hide UserButton footer badges by hiding the footer area if it only contains badges
  document.querySelectorAll<HTMLElement>('.cl-userButtonPopoverFooter').forEach((footer) => {
    footer.style.setProperty("display", "none", "important");
  });
}

const badgeObserver = new MutationObserver(() => {
  // Run immediately and debounce to avoid excessive calls
  hideBadges();
});
badgeObserver.observe(document.body, { childList: true, subtree: true });
// Run once immediately on load
hideBadges();

createRoot(document.getElementById("root")!).render(<App />);
