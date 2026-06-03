import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-32">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
