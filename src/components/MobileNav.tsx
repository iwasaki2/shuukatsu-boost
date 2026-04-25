"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { href: "#concept", label: "コンセプト" },
  { href: "#service", label: "機能" },
  { href: "#pricing", label: "料金" },
  { href: "/companies", label: "選考一覧" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 active:scale-95"
      >
        {open ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
            <path d="M0 0.5H16M0 6.5H16M0 12.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <div
        className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(26,45,122,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="space-y-1 p-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="border-t border-white/10 p-4">
          <Link
            href="/input"
            onClick={() => setOpen(false)}
            className="block rounded-full bg-[var(--gold)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
          >
            無料で始める
          </Link>
        </div>
      </div>
    </div>
  );
}
