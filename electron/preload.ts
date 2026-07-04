import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  appName: "Mini POS",
  version: "1.0.0",
});
