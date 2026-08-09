"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Trophy,
  Shield,
  Crosshair,
} from "lucide-react";

import { useMember } from "@/context/MemberContext";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { currentMember, loading } = useMember();

  /*
   * Don't show the navigation while we are determining
   * whether the visitor is logged in.
   */
  if (loading) {
    return null;
  }

  /*
   * Logged-out visitors should only see the public
   * landing page and its Log In / Join the League options.
   */
  if (!currentMember.memberId) {
    return null;
  }

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
  ...(currentMember.role === "COMMISSIONER"
    ? [
        {
          label: "Admin",
          href: "/admin",
          icon: Shield,
        },
      ]
    : []),
];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
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