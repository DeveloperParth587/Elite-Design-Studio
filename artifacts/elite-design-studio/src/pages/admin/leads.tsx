import { useState, useEffect } from "react";
import { Search, Trash2, Mail, Download, Flame, Snowflake } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useListLeads, useDeleteLead,
  getListLeadsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@workspace/api-client-react";

const REFETCH_MS = 8_000;

function useTimeSince(ts: number) {
  const [label, setLabel] = useState("just now");
  useEffect(() => {
    const tick = () => {
      const s = Math.round((Date.now() - ts) / 1000);
      setLabel(s < 5 ? "just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ts]);
  return label;
}

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "HOT" | "COLD">("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = filter !== "ALL" ? { classification: filter as "HOT" | "COLD" } : {};
  const { data: leads = [], isLoading, dataUpdatedAt } = useListLeads(params, {
    query: { queryKey: getListLeadsQueryKey(params), refetchInterval: REFETCH_MS },
  });
  const updatedLabel = useTimeSince(dataUpdatedAt);
  const { mutateAsync: deleteLead } = useDeleteLead();

  const filtered = leads.filter(
    (l) => !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteLead({ id });
      await queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      toast({ title: "Lead deleted" });
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Lead Management</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] tracking-widest uppercase text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · {updatedLabel}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border gap-1.5"
              onClick={() => window.open("/api/leads/export?format=xlsx", "_blank")}
            >
              <Download size={14} /> Export XLSX
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border gap-1.5"
              onClick={() => window.open("/api/leads/export?format=pdf", "_blank")}
            >
              <Download size={14} /> Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "HOT", "COLD"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={`text-xs tracking-[0.1em] uppercase ${
                  filter === f ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                }`}
              >
                {f === "HOT" && <Flame size={12} className="mr-1" />}
                {f === "COLD" && <Snowflake size={12} className="mr-1" />}
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p>No leads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium hidden md:table-cell">Contact</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium hidden lg:table-cell">Budget</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium hidden lg:table-cell">Type</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Status</th>
                      <th className="text-right px-6 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 md:hidden">{lead.email}</p>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-muted-foreground text-xs">{lead.email}</p>
                          {lead.phone && <p className="text-muted-foreground text-xs mt-0.5">{lead.phone}</p>}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-primary font-medium">₹{(lead.budget / 100000).toFixed(0)}L</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lead.timeline} days</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground text-xs">{lead.propertyType}</td>
                        <td className="px-4 py-4">
                          <Badge
                            className={`text-[9px] tracking-[0.1em] uppercase ${
                              lead.classification === "HOT"
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {lead.classification === "HOT" ? <Flame size={10} className="mr-1" /> : <Snowflake size={10} className="mr-1" />}
                            {lead.classification}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {lead.generatedEmail && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary mr-1"
                              onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                            >
                              <Mail size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead detail dialog */}
        <Dialog open={!!selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="tracking-wide">{selectedLead?.name}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Email", value: selectedLead.email },
                    { label: "Phone", value: selectedLead.phone ?? "—" },
                    { label: "Budget", value: `₹${(selectedLead.budget / 100000).toFixed(0)}L` },
                    { label: "Timeline", value: `${selectedLead.timeline} days` },
                    { label: "Property", value: selectedLead.propertyType },
                    { label: "Status", value: selectedLead.classification },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">{label}</p>
                      <p className={`font-medium ${label === "Status" && selectedLead.classification === "HOT" ? "text-orange-400" : label === "Status" ? "text-blue-400" : "text-foreground"}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                {selectedLead.message && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Message</p>
                    <p className="text-foreground/80 bg-muted p-3 rounded-lg text-xs leading-relaxed">{selectedLead.message}</p>
                  </div>
                )}
                {selectedLead.generatedEmail && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Generated Email</p>
                    <textarea
                      readOnly
                      value={selectedLead.generatedEmail}
                      rows={8}
                      className="w-full bg-muted border border-border rounded-lg p-3 text-xs text-foreground/80 resize-none focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs border-border"
                      onClick={() => { navigator.clipboard.writeText(selectedLead.generatedEmail ?? ""); toast({ title: "Copied to clipboard" }); }}
                    >
                      Copy Email
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
