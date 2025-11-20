import "./styles/main.css";

import { GameClient } from "@client/GameClient";

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("App container not found");
}

const serverUrl = import.meta.env.VITE_SERVER_URL ?? "ws://localhost:8080/";

const client = new GameClient(appRoot, {
  serverUrl,
  playerName: "Starling",
  version: "0.5.0"
});

client.start();
