import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";
import { AuthProvider } from "@/context/AuthContext.tsx";
import ToastContext from "@/context/ToastContext.tsx";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ToastContext />
    <HashRouter>
      <App />
    </HashRouter>
  </AuthProvider>
);
