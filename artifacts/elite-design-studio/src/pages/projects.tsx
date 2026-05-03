import { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useListProjects } from "@workspace/api-client-react";

const CATEGORIES = ["All", "Residential", "Commercial", "Hospitality"];

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
      <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Our Work</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Project Portfolio</h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            A curated selection of our most significant transformations — from intimate residences to landmark commercial projects.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                className={`text-xs tracking-[0.15em] uppercase ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <div key={project.id} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=60";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[9px] tracking-[0.15em] uppercase border-primary/30 text-primary shrink-0">
                      {project.category}
                    </Badge>
                    {project.featured && (
                      <Badge variant="secondary" className="text-[9px] tracking-[0.1em] uppercase shrink-0">Featured</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground tracking-wide mb-1">{project.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    {project.location && (
                      <span className="text-xs text-muted-foreground">{project.location}</span>
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
