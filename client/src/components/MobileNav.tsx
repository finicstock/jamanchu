/**
 * MobileNav - 하단 네비게이션 바
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 네온 민트/핑크 액센트, 두꺼운 보더, 다크 배경
 */
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, MessageSquare, FileText, Sparkles, CreditCard } from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: Home, label: "홈" },
  { path: "/chat-log", icon: MessageSquare, label: "채팅" },
  { path: "/clone-setup", icon: Sparkles, label: "클론" },
  { path: "/report", icon: FileText, label: "리포트" },
  { path: "/pricing", icon: CreditCard, label: "상점" },
];

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[oklch(0.22_0.005_260)] bg-[oklch(0.08_0.005_260/95%)] backdrop-blur-xl">
      <div className="container flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[2px] left-1/2 h-[2px] w-8 -translate-x-1/2 bg-neon-mint neon-glow-mint"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? "text-neon-mint drop-shadow-[0_0_8px_oklch(0.85_0.18_170/50%)]" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-medium tracking-wider uppercase ${
                  isActive ? "text-neon-mint" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
