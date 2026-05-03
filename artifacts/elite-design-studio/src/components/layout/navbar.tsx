import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, useUser, UserButton } from "@clerk/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/consultation", label: "Consultation" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-foreground/90">
            Elite Design Studio
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 text-xs tracking-widest uppercase font-medium transition-colors rounded-md",
                location === href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex text-xs tracking-widest uppercase border-primary/30 text-primary hover:bg-primary/10">
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="hidden md:flex text-xs tracking-widest uppercase border-primary/30 text-primary hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </Show>

          <button
            className="md:hidden text-foreground/70 hover:text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-background/95 px-6 py-4 flex flex-col gap-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-xs tracking-widest uppercase font-medium py-2",
                location === href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <Show when="signed-in">
            <Link href="/admin" onClick={() => setOpen(false)}>
              <span className="text-xs tracking-widest uppercase font-medium text-primary py-2 block">Dashboard</span>
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" onClick={() => setOpen(false)}>
              <span className="text-xs tracking-widest uppercase font-medium text-primary py-2 block">Sign In</span>
            </Link>
          </Show>
        </div>
      )}
    </header>
  );
}
