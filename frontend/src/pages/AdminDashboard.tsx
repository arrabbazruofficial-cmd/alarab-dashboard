import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Users, Building2, FileText, Plane } from "lucide-react";
import { api } from "@/lib/api";

interface RequestItem {
  id: string;
  request_type: string;
  status: string;
  agency?: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/requests/');
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const stats = [
    { label: "Total Requests", value: requests.length.toString(), icon: FileText, trend: "+12%" },
    { label: "Pending Approvals", value: requests.filter(r => r.status === 'SUBMITTED' || r.status === 'DRAFT').length.toString(), icon: Users, trend: "+4%" },
    { label: "Group Visas", value: requests.filter(r => r.request_type === 'GROUP_VISA').length.toString(), icon: Building2, trend: "+20%" },
    { label: "Air Tickets", value: requests.filter(r => r.request_type === 'AIR_TICKET').length.toString(), icon: Plane, trend: "-2%" },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of platform activity and incoming travel requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6 h-[400px]">
            <h3 className="font-semibold mb-4">Request Activity</h3>
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-border rounded-lg text-muted-foreground">
              [Chart Placeholder - Recharts]
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] overflow-y-auto">
            <h3 className="font-semibold mb-4">Recent Requests</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent requests.</p>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm font-medium">{req.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{req.request_type.replace('_', ' ')} • {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
