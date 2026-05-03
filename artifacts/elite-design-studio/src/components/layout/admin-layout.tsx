import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import {
  LayoutDashboard, Users, FolderOpen, Sparkles, Mail,
  MessageSquareQuote, Menu, X, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/admin/email-generator", label: "Email Generator", icon: Mail },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border justify-between">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-[9px] font-bold tracking-widest text-primary">EDS</span>
              </div>
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-foreground/80">Studio</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <ChevronRight size={16} className={cn("transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
          {sidebarLinks.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  active
                    ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="text-xs tracking-wide font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn(
          "p-4 border-t border-sidebar-border flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <UserButton />
          {!collapsed && <span className="text-xs text-muted-foreground">Account</span>}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-border flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-[9px] font-bold tracking-widest text-primary">EDS</span>
          </div>
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-foreground/80">Studio</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground/70">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-14">
          <nav className="flex flex-col gap-1 p-4">
            {sidebarLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm",
                  location === href
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className={cn("flex-1 overflow-auto md:pt-0 pt-14")}>
        {children}
      </main>
    </div>
  );
}
