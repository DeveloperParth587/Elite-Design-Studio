import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Projects from "@/pages/projects";
import About from "@/pages/about";
import TestimonialsPage from "@/pages/testimonials";
import Consultation from "@/pages/consultation";
import Contact from "@/pages/contact";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminLeads from "@/pages/admin/leads";
import AdminProjects from "@/pages/admin/projects";
import AIStudio from "@/pages/admin/ai-studio";
import EmailGenerator from "@/pages/admin/email-generator";
import AdminTestimonials from "@/pages/admin/testimonials-admin";
import SharePage from "@/pages/share";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#c8a96e",
    colorForeground: "#f5f0e8",
    colorMutedForeground: "#8b7355",
    colorDanger: "#ef4444",
    colorBackground: "#1a1a1a",
    colorInput: "#252525",
    colorInputForeground: "#f5f0e8",
    colorNeutral: "#3a3a3a",
    fontFamily: "'Cormorant Garamond', serif",
    borderRadius: "4px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f5f0e8]",
    headerSubtitle: "text-[#8b7355]",
    socialButtonsBlockButtonText: "text-[#f5f0e8]",
    formFieldLabel: "text-[#f5f0e8]",
    footerActionLink: "text-[#c8a96e]",
    footerActionText: "text-[#8b7355]",
    dividerText: "text-[#8b7355]",
    identityPreviewEditButton: "text-[#c8a96e]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#f5f0e8]",
    logoBox: "mb-2",
    socialButtonsBlockButton: "border border-[#3a3a3a] bg-[#252525] hover:bg-[#2e2e2e]",
    formButtonPrimary: "bg-[#c8a96e] hover:bg-[#b8995e] text-[#1a1a1a]",
    formFieldInput: "bg-[#252525] border-[#3a3a3a] text-[#f5f0e8]",
    dividerLine: "bg-[#3a3a3a]",
    alert: "border-[#3a3a3a]",
  },
};

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-[0.08em] uppercase text-foreground mb-2">Elite Design Studio</h1>
          <p className="text-sm text-muted-foreground mt-1 tracking-wide">Sign in to your account</p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/admin`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-[0.08em] uppercase text-foreground mb-2">Elite Design Studio</h1>
          <p className="text-sm text-muted-foreground mt-1 tracking-wide">Create your account</p>
        </div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={`${basePath}/admin`}
        />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/about" component={About} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/contact" component={Contact} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/leads">{() => <ProtectedRoute component={AdminLeads} />}</Route>
      <Route path="/admin/projects">{() => <ProtectedRoute component={AdminProjects} />}</Route>
      <Route path="/admin/ai-studio">{() => <ProtectedRoute component={AIStudio} />}</Route>
      <Route path="/admin/email-generator">{() => <ProtectedRoute component={EmailGenerator} />}</Route>
      <Route path="/admin/testimonials">{() => <ProtectedRoute component={AdminTestimonials} />}</Route>
      <Route path="/share/:token" component={SharePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
