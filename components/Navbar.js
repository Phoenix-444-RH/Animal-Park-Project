'use client';
'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "../lib/app-state";

export default function Navbar() {
  const { session, logout, cart, notifications } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/shop", label: "Shop", icon: "🛍", glow: "from-amber-100 via-white to-white" },
    { href: "/vets", label: "Vets", icon: "🩺", glow: "from-emerald-100 via-white to-white" },
    { href: "/groomers", label: "Groomers", icon: "✂", glow: "from-sky-100 via-white to-white" },
  ];

  return (
    <motion.nav initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="group flex items-center gap-3">
          <motion.div
            initial={{ rotate: -8, scale: 0.92 }}
            animate={{ rotate: [ -8, 0, -4 ], scale: [0.92, 1, 0.96] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#1c4a2e,#285c39)] shadow-[0_12px_26px_rgba(28,74,46,0.24)]"
          >
            <div className="absolute inset-0 rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(255,220,130,0.38),rgba(255,255,255,0))]" />
            <div className="relative h-7 w-7">
              <span className="absolute left-1/2 top-[2px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#f4c24d]" />
              <span className="absolute left-[2px] top-[8px] h-2.5 w-2.5 rounded-full bg-[#f4c24d]" />
              <span className="absolute right-[2px] top-[8px] h-2.5 w-2.5 rounded-full bg-[#f4c24d]" />
              <span className="absolute bottom-0 left-1/2 h-4.5 w-5 -translate-x-1/2 rounded-[45%] bg-[#f6d37a]" />
            </div>
          </motion.div>
          <div className="leading-none">
            <div className="text-[2rem] font-black tracking-tight">
              <span className="text-[#1c4a2e]">Animal</span>
              <span className="text-[#c8880a]"> Park</span>
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.36em] text-slate-400 transition duration-300 group-hover:text-[#2c6f77]">
              Care • Shop • Wellness
            </div>
          </div>
        </a>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
          {navItems.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className={`group relative overflow-hidden rounded-full border border-slate-200 bg-[linear-gradient(135deg,${item.glow})] px-4 py-2.5 text-slate-700 shadow-sm`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <motion.span
                  animate={{ y: [0, -2, 0], rotate: index === 1 ? [0, -8, 0] : [0, 6, 0] }}
                  transition={{ duration: 2.6 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[13px] shadow-[0_8px_16px_rgba(28,74,46,0.08)]"
                >
                  {item.icon}
                </motion.span>
                <span className="transition duration-300 group-hover:text-[#1c4a2e]">{item.label}</span>
              </span>
            </motion.a>
          ))}
          <a href="/cart" className="rounded-full border border-slate-300 bg-[linear-gradient(135deg,#ffffff,#f8fbff)] px-4 py-2 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#7ecad1] hover:shadow-[0_14px_28px_rgba(52,124,132,0.14)]">
            Cart ({mounted ? cart.length : 0})
          </a>
          {mounted && session ? (
            <>
              <a href="/dashboard" className="rounded-full bg-[linear-gradient(135deg,#1c4a2e,#2a6b43)] px-4 py-2 text-white shadow-[0_14px_28px_rgba(28,74,46,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(28,74,46,0.24)]">Dashboard {notifications.length > 0 ? `(${notifications.length})` : ""}</a>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="rounded-full border border-slate-300 bg-[linear-gradient(135deg,#ffffff,#fdfdfd)] px-4 py-2 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#e0b95a]"
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="rounded-full bg-[linear-gradient(135deg,#1c4a2e,#2a6b43)] px-4 py-2 text-white shadow-[0_14px_28px_rgba(28,74,46,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(28,74,46,0.24)]">Login</a>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
