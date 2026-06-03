import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, Siren, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/" | "/providers" | "/sos" | "/history" | "/profile";
  label: string;
  icon: typeof Home;
  primary?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/providers", label: "Nearby", icon: MapPin },
  { to: "/sos", label: "SOS", icon: Siren, primary: true },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4">
      <div className="relative flex items-end justify-between rounded-3xl border border-border/60 bg-surface-elevated/90 px-3 py-2 shadow-elevated backdrop-blur-xl">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="-mt-8 flex flex-col items-center gap-1"
              >
                <span className="relative grid h-16 w-16 place-items-center rounded-full bg-emergency text-primary-foreground shadow-glow ring-4 ring-background">
                  <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping-slow" />
                  <Icon className="relative h-7 w-7" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
