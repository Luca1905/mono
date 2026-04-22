import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import App from "./app";

export const renderer = await createCliRenderer({
  openConsoleOnError: true,
  backgroundColor: "#ffffff",
  consoleOptions: {
    position: ConsolePosition.BOTTOM, // Position on screen
    sizePercent: 30, // Size as percentage of terminal
    colorInfo: "#00FFFF", // Color for console.info
    colorWarn: "#FFFF00", // Color for console.warn
    colorError: "#FF0000", // Color for console.error
    startInDebugMode: false, // Show file/line info in logs
  },
});

createRoot(renderer).render(<App />);
