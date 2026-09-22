import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { loadCategories } from "./lib/api";

// Kategoriya daraxti menyu va sahifalarda sinxron ishlatiladi — avval yuklab olamiz.
// Backend javob bermasa ham sayt ochiladi (kategoriyalarsiz).
loadCategories().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
});
