import { Link } from "wouter";
import { ArrowRight, Award, Users, Home as HomeIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import { useGetFeaturedProjects, useListTestimonials } from "@workspace/api-client-react";

const FALLBACK = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";

export default function Home() {
  const { data: featuredProjects = [], isLoading } = useGetFeaturedProjects();
  const { data: testimonials = [] } = useListTestimonials();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-5 text-primary border-primary/30 tracking-[0.2em] uppercase text-[10px]">
            Premium Interior Design
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-5 leading-[1.05]">
            <span className="text-foreground">Spaces That</span>
            <br />
            <span className="gold-text">Define You</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed tracking-wide">
            We craft interiors where luxury meets intention. Every surface, every light, every texture — curated for those who demand the extraordinary.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="w-full sm:w-auto text-xs tracking-[0.2em] uppercase font-medium px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                Book Consultation <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs tracking-[0.2em] uppercase font-medium px-8 border-primary/30 text-primary hover:bg-primary/10">
                View Projects
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-primary/40" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: "Projects Delivered", value: "200+" },
            { label: "Years of Excellence", value: "15" },
            { label: "Cities Served", value: "12" },
            { label: "Client Satisfaction", value: "98%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold gold-text mb-1 sm:mb-2">{value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-[0.15em] uppercase leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Portfolio</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Featured Work</h2>
          </div>
          <Link href="/projects">
            <Button variant="ghost" className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary gap-2 hidden sm:flex">
              All Projects <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No projects yet — add projects from the admin dashboard.</p>
            <Link href="/admin/projects">
              <Button variant="outline" size="sm" className="mt-4 text-xs border-primary/30 text-primary">Go to Admin</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredProjects.slice(0, 6).map((project) => (
              <div key={project.id} className="group relative overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <Badge variant="outline" className="text-[9px] tracking-[0.2em] uppercase border-primary/40 text-primary mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="text-white font-semibold tracking-wide text-sm">{project.title}</h3>
                  {project.location && <p className="text-white/60 text-xs mt-0.5">{project.location}</p>}
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{project.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{project.category}</p>
                    </div>
                    {project.budget && (
                      <span className="text-xs text-primary font-medium shrink-0 ml-2">
                        ₹{(parseInt(project.budget) / 100000).toFixed(0)}L
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/projects">
            <Button variant="ghost" className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary gap-2">
              View All Projects <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">What We Do</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Crafting Extraordinary Spaces</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: HomeIcon, title: "Residential Design", desc: "Bespoke interiors for luxury homes, penthouses, and villas. Every detail curated to reflect your unique identity." },
              { icon: Award, title: "Commercial Spaces", desc: "Corporate headquarters, boutique hotels, and retail environments that make an indelible impression." },
              { icon: Users, title: "Full-Service Execution", desc: "From concept to completion — we manage every contractor, material, and milestone on your behalf." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 sm:p-8 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-base font-semibold tracking-wide mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials preview */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Client Stories</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {testimonials.slice(0, 2).map((t) => (
              <div key={t.id} className="p-6 sm:p-8 rounded-xl border border-border bg-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-5 italic text-sm sm:text-base">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.clientName} loading="lazy" className="w-9 h-9 rounded-full object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{t.clientName[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/testimonials">
              <Button variant="outline" className="text-xs tracking-[0.2em] uppercase border-primary/30 text-primary hover:bg-primary/10">
                Read All Stories <ArrowRight size={13} className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6">
            Ready to Transform<br />
            <span className="gold-text">Your Space?</span>
          </h2>
          <p className="text-muted-foreground mb-8 sm:mb-10 text-base sm:text-lg">
            Schedule a complimentary consultation with our principal designer. Let's begin the conversation.
          </p>
          <Link href="/consultation">
            <Button size="lg" className="text-xs tracking-[0.2em] uppercase font-medium px-8 sm:px-10 bg-primary text-primary-foreground hover:bg-primary/90">
              Book a Consultation <ArrowRight size={15} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground/70">Elite Design Studio</span>
          </div>
          <p className="text-xs text-muted-foreground tracking-wide text-center">
            &copy; {new Date().getFullYear()} Elite Design Studio. All rights reserved.
          </p>
          <div className="flex gap-5 sm:gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <Link key={l} href={l === "Contact" ? "/contact" : "#"} className="text-xs text-muted-foreground hover:text-primary tracking-wider uppercase">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
