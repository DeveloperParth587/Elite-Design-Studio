import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateLead } from "@workspace/api-client-react";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  budget: z.coerce.number().min(100000, "Minimum budget is ₹1 Lakh"),
  timeline: z.coerce.number().min(7, "Minimum timeline is 7 days").max(730, "Maximum timeline is 2 years"),
  propertyType: z.string().min(1, "Please select a property type"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PROPERTY_TYPES = [
  "Full Home", "Living Room", "Bedroom", "Kitchen", "Bathroom",
  "Office", "Commercial", "Retail", "Hospitality", "Other"
];

export default function Consultation() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createLead, isPending } = useCreateLead();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { propertyType: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createLead({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          budget: data.budget,
          timeline: data.timeline,
          propertyType: data.propertyType,
          message: data.message,
        },
      });
      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center max-w-md px-6 pt-20">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Consultation Requested</h2>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            Thank you. Our principal designer will be in touch within 24 hours to schedule your complimentary consultation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left info */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Begin Your Journey</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-5">Book a<br />Consultation</h1>
            <p className="text-muted-foreground leading-relaxed mb-7 text-sm sm:text-base">
              Every great interior begins with an honest conversation. Tell us about your space, your vision, and your timeline — we'll handle the rest.
            </p>
            <div className="space-y-4">
              {[
                { step: "01", title: "Submit Your Brief", desc: "Fill in the form with your project details" },
                { step: "02", title: "Designer Call", desc: "A 30-min discovery call with our principal designer" },
                { step: "03", title: "Proposal & Quote", desc: "Receive a tailored design proposal within 5 days" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Full Name *</Label>
                <Input {...register("name")} placeholder="Your name" className="bg-background border-border" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Email Address *</Label>
                <Input {...register("email")} type="email" placeholder="your@email.com" className="bg-background border-border" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Phone Number</Label>
                <Input {...register("phone")} type="tel" placeholder="+91 98765 43210" className="bg-background border-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Budget (₹) *</Label>
                  <Input {...register("budget")} type="number" placeholder="500000" className="bg-background border-border" />
                  {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget.message}</p>}
                </div>
                <div>
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Timeline (days) *</Label>
                  <Input {...register("timeline")} type="number" placeholder="90" className="bg-background border-border" />
                  {errors.timeline && <p className="text-xs text-destructive mt-1">{errors.timeline.message}</p>}
                </div>
              </div>

              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Property Type *</Label>
                <select
                  {...register("propertyType")}
                  className="w-full rounded-md border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select type...</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.propertyType && <p className="text-xs text-destructive mt-1">{errors.propertyType.message}</p>}
              </div>

              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Message</Label>
                <Textarea
                  {...register("message")}
                  placeholder="Tell us about your vision, inspirations, or any specific requirements..."
                  rows={3}
                  className="bg-background border-border resize-none text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5"
              >
                {isPending ? "Submitting..." : <span className="flex items-center gap-2">Submit Request <ArrowRight size={14} /></span>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
