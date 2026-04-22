import { RGBA } from "@opentui/core";
import { type ReactNode, useEffect, useRef, useState } from "react";

type BlinkingBoxProps = {
  children?: ReactNode;
  focused: boolean;
  baseIntensity?: number;
  peakIntensity?: number;
  pulseDurationMs?: number;
  [key: string]: unknown;
};

function gray(intensity: number) {
  return RGBA.fromInts(intensity, intensity, intensity, 255);
}

export function BlinkingBox({
  children,
  focused,
  baseIntensity = 0,
  peakIntensity = 255,
  pulseDurationMs = 500,
  ...boxProps
}: BlinkingBoxProps) {
  const pulseRef = useRef<"base" | "peak">("base");
  const [borderColor, setBorderColor] = useState(gray(peakIntensity));

  useEffect(() => {
    pulseRef.current = "base";

    if (!focused) {
      setBorderColor(gray(baseIntensity));
      return;
    }

    const tick = () => {
      if (pulseRef.current === "base") {
        setBorderColor(gray(peakIntensity));
        pulseRef.current = "peak";
      } else {
        setBorderColor(gray(baseIntensity));
        pulseRef.current = "base";
      }
    };

    tick();
    const interval = setInterval(tick, pulseDurationMs);

    return () => {
      clearInterval(interval);
    };
  }, [baseIntensity, focused, peakIntensity, pulseDurationMs]);

  return (
    <box {...boxProps} focused={focused} focusedBorderColor={borderColor}>
      {children}
    </box>
  );
}
