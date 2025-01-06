import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

// 挂载React组件
createRoot(document.getElementById("root")!).render(<App />);
