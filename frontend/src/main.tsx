import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router"
import "./index.css"
import App from "./App"
import { initWailsBridge } from "./lib/wails-bridge"

initWailsBridge()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
