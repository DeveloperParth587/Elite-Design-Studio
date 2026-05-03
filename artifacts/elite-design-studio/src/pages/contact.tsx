import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold">Let's Talk</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Whether you have a question, a project brief, or simply want to learn more about how we work — we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
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
              <div key={label} className="flex gap-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
                  {lines.map((line, i) => (
                    <p key={i} className="text-foreground/90 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Offices</p>
              <div className="grid grid-cols-2 gap-3">
                {["Mumbai", "New Delhi", "Bengaluru", "Hyderabad"].map((city) => (
                  <div key={city} className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground/80 text-center">
                    {city}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map placeholder + CTA */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden min-h-[300px] relative">
              <img
                src="https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80"
                alt="Mumbai cityscape"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium tracking-wide">Nariman Point, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold tracking-wide mb-2">Ready to start a project?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Book a complimentary consultation with our principal designer.
              </p>
              <Link href="/consultation">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
