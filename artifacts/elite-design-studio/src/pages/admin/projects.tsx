import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProjects, useCreateProject, useUpdateProject, useDeleteProject,
  getListProjectsQueryKey,
} from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Enter a valid image URL"),
  featured: z.boolean().default(false),
  budget: z.string().optional(),
  location: z.string().optional(),
  completedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = ["Residential", "Commercial", "Hospitality", "Retail", "Other"];

export default function AdminProjects() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useListProjects({}, {
    query: { queryKey: getListProjectsQueryKey() },
  });
  const { mutateAsync: createProject, isPending: creating } = useCreateProject();
  const { mutateAsync: updateProject, isPending: updating } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();

  const filtered = projects.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { featured: false },
  });

  const openCreate = () => {
    setEditProject(null);
    reset({ featured: false });
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditProject(project);
    reset({
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.imageUrl,
      featured: project.featured,
      budget: project.budget ?? "",
      location: project.location ?? "",
      completedAt: project.completedAt ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editProject) {
        await updateProject({ id: editProject.id, data });
        toast({ title: "Project updated" });
      } else {
        await createProject({ data });
        toast({ title: "Project created" });
      }
      await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject({ id });
      await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const featured = watch("featured");

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
            <h1 className="text-2xl font-bold">Projects</h1>
          </div>
          <Button onClick={openCreate} size="sm" className="text-xs tracking-wide bg-primary text-primary-foreground gap-1.5">
            <Plus size={14} /> New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <Card key={project.id} className="bg-card border-border overflow-hidden group">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=60"; }}
                  />
                  <div className="absolute top-3 right-3 flex gap-1">
                    {project.featured && (
                      <Badge className="bg-primary/90 text-primary-foreground text-[9px] tracking-wide">
                        <Star size={9} className="mr-1 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-[9px] tracking-[0.12em] uppercase border-primary/30 text-primary mb-1.5">
                        {project.category}
                      </Badge>
                      <h3 className="font-semibold text-sm text-foreground truncate">{project.title}</h3>
                      {project.location && (
                        <p className="text-xs text-muted-foreground mt-0.5">{project.location}</p>
                      )}
                    </div>
                    {project.budget && (
                      <span className="text-xs text-primary font-medium shrink-0">
                        ₹{(parseInt(project.budget) / 100000).toFixed(0)}L
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-border gap-1.5 h-7"
                      onClick={() => openEdit(project)}
                    >
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="tracking-wide">{editProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Title *</Label>
              <Input {...register("title")} className="bg-background border-border" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Description *</Label>
              <Textarea {...register("description")} rows={3} className="bg-background border-border resize-none" />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Category *</Label>
                <select
                  {...register("category")}
                  className="w-full rounded-md border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Budget (₹)</Label>
                <Input {...register("budget")} placeholder="e.g. 5000000" className="bg-background border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Image URL *</Label>
              <Input {...register("imageUrl")} placeholder="https://..." className="bg-background border-border" />
              {errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Location</Label>
                <Input {...register("location")} placeholder="City, State" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Completed At</Label>
                <Input {...register("completedAt")} type="date" className="bg-background border-border" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setValue("featured", e.target.checked)}
                className="accent-primary"
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">Mark as featured project</Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-xs border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating} className="text-xs bg-primary text-primary-foreground">
                {creating || updating ? "Saving..." : editProject ? "Save Changes" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
