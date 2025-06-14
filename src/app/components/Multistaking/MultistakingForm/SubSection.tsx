import React from "react";
import { twJoin } from "tailwind-merge";

export const SubSection = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => (
  <div
    className={twJoin(
      "flex bg-secondary-highlight text-accent-primary p-4",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);
