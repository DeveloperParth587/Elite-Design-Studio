import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Copy, RefreshCw, Check } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGenerateEmail } from "@workspace/api-client-react";

const schema = z.object({
  name: z.string().min(2, "Enter client name"),
  budget: z.coerce.number().min(1, "Enter budget"),
  projectType: z.string().min(1, "Enter project type"),
});

type FormValues = z.infer<typeof schema>;

export default function EmailGenerator() {
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: generateEmail, isPending } = useGenerateEmail();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await generateEmail({ data: { name: data.name, budget: data.budget, projectType: data.projectType } });
      setResult(res);
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Email copied to clipboard" });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Mail size={22} className="text-primary" />
            Email Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate personalised follow-up emails for leads using AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm tracking-wide font-semibold">Client Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Client Name *</Label>
                  <Input {...register("name")} placeholder="e.g. Rahul Mehta" className="bg-background border-border" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Budget (₹) *</Label>
                  <Input {...register("budget")} type="number" placeholder="e.g. 5000000" className="bg-background border-border" />
                  {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget.message}</p>}
                </div>

                <div>
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Project Type *</Label>
                  <Input {...register("projectType")} placeholder="e.g. Full Home Renovation" className="bg-background border-border" />
                  {errors.projectType && <p className="text-xs text-destructive mt-1">{errors.projectType.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase gap-2"
                >
                  {isPending ? (
                    <><RefreshCw size={14} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Mail size={14} /> Generate Email</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className={`bg-card border-border ${result ? "border-primary/20" : ""}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm tracking-wide font-semibold">Generated Email</CardTitle>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs border-border gap-1.5"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Subject</p>
                    <p className="text-sm font-semibold text-foreground p-3 bg-muted rounded-lg">{result.subject}</p>
                  </div>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Body</p>
                    <textarea
                      readOnly
                      value={result.body}
                      rows={12}
                      className="w-full bg-muted border border-border rounded-lg p-3 text-xs text-foreground/85 leading-relaxed resize-none focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <Mail size={22} className="text-primary/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No email generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Fill in the form to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent leads quick access */}
        <Card className="mt-6 bg-card border-border">
          <CardContent className="pt-5">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Tips</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For best results, use the client's exact budget and project type from their consultation form. 
              You can find this information in the <strong className="text-foreground">Leads</strong> section. 
              The AI generates warm, personalised emails tailored to each client's specific investment and vision.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
