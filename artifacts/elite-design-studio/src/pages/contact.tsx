import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Get in Touch</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Let's Talk</h1>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Whether you have a question, a project brief, or simply want to learn more about how we work — we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8">
            {[
              {
                icon: MapPin,
                label: "Studio Address",
                lines: ["Level 12, The Oberoi Centre", "Nariman Point, Mumbai 400021"],
              },
              {
                icon: Phone,
                label: "Phone",
                lines: ["+91 22 6655 4400", "+91 98200 44321"],
              },
              {
                icon: Mail,
                label: "Email",
                lines: ["hello@elitedesignstudio.in", "projects@elitedesignstudio.in"],
              },
              {
                icon: Clock,
                label: "Working Hours",
                lines: ["Monday – Saturday: 9:00 AM – 7:00 PM", "Sunday: By appointment only"],
              },
            ].map(({ icon: Icon, label, lines }) => (
              <div key={label} className="flex gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
                  {lines.map((line) => (
                    <p key={line} className="text-sm sm:text-base text-foreground">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Panel */}
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="p-6 sm:p-8 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-lg sm:text-xl mb-2 tracking-wide">Start a Project</h3>
              <p className="text-muted-foreground text-sm mb-5 sm:mb-6 leading-relaxed">
                Ready to transform your space? Book a complimentary 30-minute consultation with our principal designer.
              </p>
              <Link href="/consultation">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase gap-2">
                  Book Consultation <ArrowRight size={13} />
                </Button>
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-lg sm:text-xl mb-2 tracking-wide">Studio Visits</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                We welcome clients to visit our Mumbai studio by appointment. See our material library, mood boards, and completed project photography in person.
              </p>
              <p className="text-xs text-primary tracking-[0.15em] uppercase">
                Call +91 22 6655 4400 to schedule
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-xl border border-border bg-card">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Follow Our Work</p>
              <div className="flex gap-3">
                {["Instagram", "Houzz", "LinkedIn"].map((s) => (
                  <span key={s} className="px-3 py-1.5 text-xs border border-primary/20 text-primary rounded-md tracking-wide cursor-pointer hover:bg-primary/10 transition-colors">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
