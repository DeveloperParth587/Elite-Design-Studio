import { Link } from "wouter";
import { ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/react";

export default function AccessDenied() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX size={28} className="text-destructive" />
        </div>
        <h1 className="text-xl font-semibold tracking-wide mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Your account does not have permission to access the admin dashboard.
          Please contact the studio administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto text-xs tracking-widest uppercase border-primary/30 text-primary hover:bg-primary/10">
              Back to Website
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-xs tracking-widest uppercase text-muted-foreground gap-2"
            onClick={() => signOut()}
          >
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
