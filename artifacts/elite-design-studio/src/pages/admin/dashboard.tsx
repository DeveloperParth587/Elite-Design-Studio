import { TrendingUp, Users, FolderOpen, Flame, Snowflake, IndianRupee, Plus } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDashboardStats, useGetLeadChart, useListLeads,
  getGetDashboardStatsQueryKey, getGetLeadChartQueryKey,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });
  const { data: chartData = [], isLoading: chartLoading } = useGetLeadChart({
    query: { queryKey: getGetLeadChartQueryKey() },
  });
  const { data: leads = [] } = useListLeads();

  const recentLeads = leads.slice(-5).reverse();

  const statCards = [
    {
      label: "Total Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Hot Leads",
      value: stats?.hotLeads ?? 0,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Cold Leads",
      value: stats?.coldLeads ?? 0,
      icon: Snowflake,
      color: "text-blue-300",
    },
    {
      label: "Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      color: "text-primary",
    },
    {
      label: "Est. Revenue",
      value: stats ? `₹${(stats.estimatedRevenue / 10000000).toFixed(1)}Cr` : "—",
      icon: IndianRupee,
      color: "text-green-400",
    },
    {
      label: "New This Month",
      value: stats?.newLeadsThisMonth ?? 0,
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/leads">
              <Button variant="outline" size="sm" className="text-xs tracking-wide border-border">
                <Users size={14} className="mr-1.5" /> Manage Leads
              </Button>
            </Link>
            <Link href="/admin/ai-studio">
              <Button size="sm" className="text-xs tracking-wide bg-primary text-primary-foreground">
                <Plus size={14} className="mr-1.5" /> AI Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between mb-3">
                  <Icon size={18} className={color} />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-7 w-14 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                )}
                <p className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Lead Volume by Month</CardTitle>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 14%)" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(38 8% 52%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(38 8% 52%)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(20 10% 8%)",
                          border: "1px solid hsl(20 10% 16%)",
                          borderRadius: "8px",
                          color: "hsl(38 18% 88%)",
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="hot" name="Hot" fill="hsl(38 80% 60%)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="cold" name="Cold" fill="hsl(200 55% 55%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm tracking-wide font-semibold text-foreground/90">Recent Leads</CardTitle>
              <Link href="/admin/leads">
                <span className="text-xs text-primary hover:underline">View all</span>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No leads yet</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.propertyType}</p>
                    </div>
                    <Badge
                      variant={lead.classification === "HOT" ? "default" : "secondary"}
                      className={`text-[9px] tracking-[0.1em] uppercase shrink-0 ml-2 ${
                        lead.classification === "HOT"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {lead.classification}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
