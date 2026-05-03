import { SignIn } from "@clerk/react";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-[0.08em] uppercase text-foreground mb-4">Elite Design Studio</h1>
          <p className="text-sm text-muted-foreground mt-1 tracking-wide">Sign in to your account</p>
        </div>
        <SignIn
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-border shadow-xl rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border-border bg-muted hover:bg-muted/80",
              formFieldInput: "bg-input border-border text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
