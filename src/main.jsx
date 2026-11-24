import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

// APIの接続先を設定
// 環境変数がなければローカルのSpring Bootに接続
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

//springbootとの通信でセッションcookieを送受信する
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
