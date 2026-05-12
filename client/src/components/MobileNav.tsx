/**
 * MobileNav - 하단 네비게이션 바
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { useLocation } from "wouter";
import { Home, Compass, User, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, label: "홈" },
  { path: "/clone-setup", icon: User, label: "클론" },
  { path: "/report", icon: Compass, label: "매칭" },
  { path: "/pricing", icon: ShoppingBag, label: "상점" },
];

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                isActive
                  ? "text-warm-coral"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${
                isActive ? "bg-warm-coral-light" : ""
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-warm-coral" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
