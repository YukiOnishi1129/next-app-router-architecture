"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { href: "/requests", label: "My Requests" },
  { href: "/approvals", label: "Approvals" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-muted/50 hidden w-64 border-r md:block">
      <div className="text-muted-foreground px-6 py-6 text-xs font-medium tracking-wide uppercase">
        Navigation
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:bg-muted rounded-md px-4 py-2 text-sm transition",
              pathname?.startsWith(item.href)
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
