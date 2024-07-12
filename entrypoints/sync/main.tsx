import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";
import { AuthProvider } from "@/context/AuthContext.tsx";
import ToastContext from "@/context/ToastContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ToastContext />
    <App />
  </AuthProvider>
);
