"use client";

import { ReactNode } from "react";

interface BorderAnimatedContainerProps {
  children: ReactNode;
}

export default function BorderAnimatedContainer({ children }: BorderAnimatedContainerProps) {
  return (
    <div
      className="w-full h-full rounded-2xl border border-transparent animate-border flex overflow-hidden"
      style={{
        background: `linear-gradient(45deg, #172033, rgb(30 41 59) 50%, #172033) padding-box,
                    conic-gradient(from var(--border-angle), rgb(71 85 105 / 0.48) 80%, rgb(6 182 212) 86%, rgb(103 232 249) 90%, rgb(6 182 212) 94%, rgb(71 85 105 / 0.48)) border-box`,
      }}
    >
      {children}
    </div>
  );
}
