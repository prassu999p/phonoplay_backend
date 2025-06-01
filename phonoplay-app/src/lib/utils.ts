// Utility functions for PhonoPlay
// This file is required for shadcn/ui components (e.g., Button) to work.

// Combines class names conditionally (like clsx or classnames)
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ');
}
