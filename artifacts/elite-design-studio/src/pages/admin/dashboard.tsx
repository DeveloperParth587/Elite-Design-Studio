import { useState, useRef } from "react";
import { TrendingUp, Users, FolderOpen, Flame, Snowflake, IndianRupee, Plus, Upload, Trash2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useGetDashboardStats, useGetLeadChart, useListLeads,
  getGetDashboardStatsQueryKey, getGetLeadChartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=60";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });
  const { data: chartData = [], isLoading: chartLoading } = useGetLeadChart({
    query: { queryKey: getGetLeadChartQueryKey() },
  });
  const { data: leads = [] } = useListLeads();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState<"projects" | "leads" | null>(null);
  const [clearing, setClearing] = useState(false);
  const projectsRef = useRef<HTMLInputElement>(null);
  const leadsRef = useRef<HTMLInputElement>(null);

  const recentLeads = leads.slice(-5).reverse();
  const noData = !statsLoading && (stats?.totalLeads ?? 0) === 0 && (stats?.totalProjects ?? 0) === 0;

  const pieData = stats && (stats.hotLeads > 0 || stats.coldLeads > 0) ? [
    { name: "Hot Leads", value: stats.hotLeads, color: "#f97316" },
    { name: "Cold Leads", value: stats.coldLeads, color: "#60a5fa" },
  ] : [];

  const statCards = [
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: Users, color: "text-blue-400", bg: "from-blue-500/10 to-blue-500/5" },
    { label: "Hot Leads", value: stats?.hotLeads ?? 0, icon: Flame, color: "text-orange-400", bg: "from-orange-500/10 to-orange-500/5" },
    { label: "Cold Leads", value: stats?.coldLeads ?? 0, icon: Snowflake, color: "text-sky-400", bg: "from-sky-500/10 to-sky-500/5" },
    { label: "Projects", value: stats?.totalProjects ?? 0, icon: FolderOpen, color: "text-primary", bg: "from-primary/10 to-primary/5" },
    { label: "Est. Revenue", value: stats ? `₹${(stats.estimatedRevenue / 10000000).toFixed(1)}Cr` : "—", icon: IndianRupee, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5" },
    { label: "New This Month", value: stats?.newLeadsThisMonth ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "from-purple-500/10 to-purple-500/5" },
  ];

  const handleImport = async (type: "projects" | "leads", file: File) => {
    setImporting(type);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const res = await fetch(`/api/import/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      toast({ title: data.message });
      queryClient.invalidateQueries();
    } catch (err) {
      toast({ title: "Import failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete ALL data? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/admin/clear-data", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear data");
      toast({ title: "All data cleared" });
      queryClient.invalidateQueries();
    } catch {
      toast({ title: "Failed to clear data", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={projectsRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport("projects", f); e.target.value = ""; }} />
            <input ref={leadsRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport("leads", f); e.target.value = ""; }} />
            <Button variant="outline" size="sm" className="text-xs border-border gap-1.5" onClick={() => projectsRef.current?.click()} disabled={!!importing}>
              <Upload size={13} /> {importing === "projects" ? "Importing..." : "Import Projects"}
            </Button>
            <Button variant="outline" size="sm" className="text-xs border-border gap-1.5" onClick={() => leadsRef.current?.click()} disabled={!!importing}>
              <FileSpreadsheet size={13} /> {importing === "leads" ? "Importing..." : "Import Leads"}
            </Button>
            <Link href="/admin/ai-studio">
              <Button size="sm" className="text-xs bg-primary text-primary-foreground gap-1.5">
                <Plus size={13} /> AI Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty state — no data yet */}
        {noData && (
          <Card className="mb-6 bg-card border-primary/20 border">
            <CardContent className="py-8 px-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-primary" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-semibold text-foreground mb-1">No data yet — Import to get started</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload an Excel (.xlsx) file to populate projects and leads. Your Excel should have a header row followed by data rows.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-xs text-muted-foreground">
                  <span className="bg-muted px-3 py-1.5 rounded-lg font-mono">Projects: Title | Description | Category | ImageURL | Featured | Budget | Location</span>
                  <span className="bg-muted px-3 py-1.5 rounded-lg font-mono">Leads: Name | Email | Phone | Budget | Timeline(days) | PropertyType | Message</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" className="text-xs bg-primary text-primary-foreground gap-1.5" onClick={() => projectsRef.current?.click()}>
                  <Upload size={13} /> Import Projects
                </Button>
                <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary gap-1.5" onClick={() => leadsRef.current?.click()}>
                  <FileSpreadsheet size={13} /> Import Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={`bg-gradient-to-br ${bg} border-border overflow-hidden`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between mb-2">
                  <Icon size={16} className={color} />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-7 w-14 mb-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
                )}
                <p className="text-[9px] sm:text-[10px] text-muted-foreground tracking-[0.1em] uppercase mt-0.5 leading-tight">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts + Recent Leads */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          {/* Bar Chart — monthly */}
          <div className="xl:col-span-2">
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Lead Volume by Month</CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4">
                {chartLoading ? (
                  <Skeleton className="h-52 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 14%)" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(38 8% 52%)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(38 8% 52%)", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(20 10% 8%)", border: "1px solid hsl(20 10% 16%)", borderRadius: "8px", color: "hsl(38 18% 88%)", fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="hot" name="Hot" fill="#f97316" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="cold" name="Cold" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart — HOT/COLD ratio */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Lead Classification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center px-2">
              {statsLoading ? (
                <Skeleton className="h-40 w-40 rounded-full" />
              ) : pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(20 10% 8%)", border: "1px solid hsl(20 10% 16%)", borderRadius: "8px", color: "hsl(38 18% 88%)", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-1">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                        <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-sm">No leads yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent Leads */}
          <div className="md:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 px-4 sm:px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Recent Leads</CardTitle>
                <Link href="/admin/leads">
                  <span className="text-xs text-primary hover:underline">View all</span>
                </Link>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-2">
                {recentLeads.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No leads yet — import from Excel or wait for consultation submissions</p>
                ) : (
                  recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{lead.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{lead.propertyType} · ₹{(lead.budget / 100000).toFixed(0)}L</p>
                      </div>
                      <Badge className={`text-[8px] tracking-[0.1em] uppercase shrink-0 ${lead.classification === "HOT" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                        {lead.classification === "HOT" ? <Flame size={8} className="mr-0.5" /> : <Snowflake size={8} className="mr-0.5" />}
                        {lead.classification}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-2">
              {[
                { href: "/admin/leads", icon: Users, label: "Manage Leads", desc: "View & export leads" },
                { href: "/admin/projects", icon: FolderOpen, label: "Manage Projects", desc: "Add, edit projects" },
                { href: "/admin/ai-studio", icon: Flame, label: "AI Studio", desc: "Generate images & video" },
                { href: "/admin/email-generator", icon: TrendingUp, label: "Email Generator", desc: "AI-powered emails" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
              <button
                onClick={handleClearData}
                disabled={clearing}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-destructive/20 hover:bg-destructive/5 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 size={14} className="text-destructive" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-destructive">{clearing ? "Clearing..." : "Clear All Data"}</p>
                  <p className="text-[10px] text-muted-foreground">Reset to empty state</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
