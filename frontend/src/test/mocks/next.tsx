import React from 'react'
import { vi } from 'vitest'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img 
      src={src} 
      alt={alt} 
      width={width}
      height={height}
      data-priority={priority ? 'true' : undefined}
      {...props} 
    />
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))