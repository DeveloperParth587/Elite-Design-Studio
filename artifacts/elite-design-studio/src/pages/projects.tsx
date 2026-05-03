import { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useListProjects } from "@workspace/api-client-react";

const CATEGORIES = ["All", "Residential", "Commercial", "Hospitality"];
const FALLBACK = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: projects = [], isLoading } = useListProjects(
    category !== "All" ? { category } : {}
  );

  const filtered = projects.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Our Work</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Project Portfolio</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm sm:text-base">
            A curated selection of our most significant transformations — from intimate residences to landmark commercial projects.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={`text-xs tracking-[0.1em] uppercase h-9 ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">{search || category !== "All" ? "No projects match your filters" : "No projects yet"}</p>
            <p className="text-sm mt-2 text-muted-foreground/70">Projects will appear here once added from the admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((project) => (
              <div key={project.id} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                  />
                  {project.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-[9px] tracking-[0.1em] uppercase bg-primary/90 text-primary-foreground">Featured</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[9px] tracking-[0.15em] uppercase border-primary/30 text-primary shrink-0">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground tracking-wide mb-1 text-sm sm:text-base">{project.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    {project.location && (
                      <span className="text-xs text-muted-foreground truncate">{project.location}</span>
                    )}
                    {project.budget && (
                      <span className="text-xs text-primary font-medium ml-auto">
                        ₹{(parseInt(project.budget) / 100000).toFixed(0)}L
                      </span>
                    )}
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
