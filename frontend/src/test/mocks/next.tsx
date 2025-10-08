import React from "react";

import { vi } from "vitest";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        data-priority={priority ? "true" : undefined}
        {...props}
      />
    );
  },
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));
