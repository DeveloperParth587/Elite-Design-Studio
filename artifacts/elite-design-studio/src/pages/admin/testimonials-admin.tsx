import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
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
  useListTestimonials, useCreateTestimonial, useDeleteTestimonial,
  getListTestimonialsQueryKey,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  clientName: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  content: z.string().min(10, "Content is required"),
  rating: z.coerce.number().min(1).max(5),
  avatarUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function AdminTestimonials() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useListTestimonials({
    query: { queryKey: getListTestimonialsQueryKey() },
  });
  const { mutateAsync: createTestimonial, isPending: creating } = useCreateTestimonial();
  const { mutateAsync: deleteTestimonial } = useDeleteTestimonial();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5 },
  });

  const ratingValue = watch("rating");

  const onSubmit = async (data: FormValues) => {
    try {
      await createTestimonial({
        data: {
          clientName: data.clientName,
          role: data.role,
          content: data.content,
          rating: data.rating,
          avatarUrl: data.avatarUrl || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
      toast({ title: "Testimonial added" });
      setDialogOpen(false);
      reset();
    } catch {
      toast({ title: "Failed to add testimonial", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTestimonial({ id });
      await queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
      toast({ title: "Testimonial deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
            <h1 className="text-2xl font-bold">Testimonials</h1>
          </div>
          <Button onClick={() => { reset({ rating: 5 }); setDialogOpen(true); }} size="sm" className="text-xs tracking-wide bg-primary text-primary-foreground gap-1.5">
            <Plus size={14} /> Add Testimonial
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>No testimonials yet.</p>
            <p className="text-sm mt-1">Add your first client testimonial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <Card key={t.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < t.rating ? "text-primary fill-primary" : "text-muted-foreground"} />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed mb-4 line-clamp-4">"{t.content}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.clientName} className="w-8 h-8 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{t.clientName[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{t.clientName}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="tracking-wide">Add Testimonial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Client Name *</Label>
                <Input {...register("clientName")} className="bg-background border-border" />
                {errors.clientName && <p className="text-xs text-destructive mt-1">{errors.clientName.message}</p>}
              </div>
              <div>
                <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Role *</Label>
                <Input {...register("role")} placeholder="e.g. CEO, Homeowner" className="bg-background border-border" />
                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
              </div>
            </div>

            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Content *</Label>
              <Textarea {...register("content")} rows={4} className="bg-background border-border resize-none" />
              {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue("rating", n)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={22}
                      className={n <= ratingValue ? "text-primary fill-primary" : "text-muted-foreground"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">Avatar URL</Label>
              <Input {...register("avatarUrl")} placeholder="https://..." className="bg-background border-border" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-xs border-border">Cancel</Button>
              <Button type="submit" disabled={creating} className="text-xs bg-primary text-primary-foreground">
                {creating ? "Adding..." : "Add Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
