import { Star } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTestimonials } from "@workspace/api-client-react";

export default function TestimonialsPage() {
  const { data: testimonials = [], isLoading } = useListTestimonials();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Client Stories</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Words From Our Clients</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Every project is a collaboration. Here is what our clients say about the experience of working with Elite Design Studio.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10 sm:mb-16">
          {[
            { label: "5-Star Reviews", value: "200+" },
            { label: "Average Rating", value: "4.9" },
            { label: "Repeat Clients", value: "68%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 sm:p-6 rounded-xl border border-border bg-card">
              <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">{value}</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground tracking-[0.15em] uppercase leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-xl border border-border bg-card space-y-4">
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
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No testimonials yet</p>
            <p className="text-sm mt-2 opacity-70">Testimonials will appear here once added by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="p-6 sm:p-8 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < t.rating ? "text-primary fill-primary" : "text-muted-foreground"} />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-5 sm:mb-6 italic text-sm sm:text-base">"{t.content}"</p>
                <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t border-border">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.clientName}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">{t.clientName[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
