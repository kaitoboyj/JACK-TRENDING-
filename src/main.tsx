import { createRoot } from "react-dom/client";
// Polyfill Node's Buffer for browser environment (needed by some Solana libs)
import { Buffer } from "buffer";
// Ensure global Buffer exists
(window as any).Buffer = (window as any).Buffer || Buffer;
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
