import { createRoot } from "react-dom/client";
// Polyfill Node's Buffer for browser environment (needed by some Solana libs)
import { Buffer } from "buffer";
// Ensure global Buffer exists
(window as any).Buffer = (window as any).Buffer || Buffer;

// Telegram Mini App compatibility: route deep links via Telegram WebApp
(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    try { tg.ready?.(); } catch {}
    const originalOpen = window.open;
    window.open = function (url: any, target?: string, features?: string) {
      try {
        const href = typeof url === "string" ? url : url?.toString?.();
        if (href) {
          tg.openLink(href, { try_instant_view: false });
          return null;
        }
      } catch {}
      return originalOpen ? originalOpen.call(window, url, target, features) : null;
    } as any;
  }
})();
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
