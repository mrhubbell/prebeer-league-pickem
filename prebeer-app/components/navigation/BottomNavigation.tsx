"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Trophy,
  Users,
  Shield,
  Crosshair,
} from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: House,
    },
    {
      label: "Picks",
      href: "/picks",
      icon: Crosshair,
    },
    {
      label: "Standings",
      href: "/standings",
      icon: Trophy,
    },
    {
      label: "League",
      href: "/league",
      icon: Users,
    },
    {
      label: "Admin",
      href: "/admin",
      icon: Shield,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center transition ${
                active
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span className="mt-1 text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}