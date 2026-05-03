import { Star } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTestimonials } from "@workspace/api-client-react";

export default function TestimonialsPage() {
  const { data: testimonials = [], isLoading } = useListTestimonials();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Client Stories</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Words From Our Clients</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every project is a collaboration. Here is what our clients say about the experience of working with Elite Design Studio.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {[
            { label: "5-Star Reviews", value: "200+" },
            { label: "Average Rating", value: "4.9" },
            { label: "Repeat Clients", value: "68%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="text-3xl font-bold gold-text mb-1">{value}</div>
              <div className="text-xs text-muted-foreground tracking-[0.15em] uppercase">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-8 rounded-xl border border-border bg-card space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>No testimonials yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="p-8 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < t.rating ? "text-primary fill-primary" : "text-muted-foreground"}
                    />
                  ))}
                </div>
                <blockquote className="text-foreground/85 leading-relaxed text-base mb-6 italic">
                  "{t.content}"
                </blockquote>
                <div className="flex items-center gap-4 pt-5 border-t border-border">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.clientName}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary font-semibold">{t.clientName[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground tracking-wide">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
