import { RGBA } from "@opentui/core";
import { type ReactNode, useEffect, useRef, useState } from "react";

type BlinkingBoxProps = {
  children?: ReactNode;
  active: boolean;
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
  active,
  baseIntensity = 255,
  peakIntensity = 0,
  pulseDurationMs = 500,
  ...boxProps
}: BlinkingBoxProps) {
  const pulseRef = useRef<"base" | "peak">("base");
  const [borderColor, setBorderColor] = useState(gray(peakIntensity));

  useEffect(() => {
    pulseRef.current = "base";

    if (!active) {
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
  }, [baseIntensity, active, peakIntensity, pulseDurationMs]);

  return (
    <box {...boxProps} border borderColor={borderColor}>
      {children}
    </box>
  );
}
