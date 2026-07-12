import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Users, Building2, ClipboardList, CheckCircle, XCircle, Bell, Settings } from 'lucide-react';
import { api } from '@/lib/api';

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: '1,234', icon: ClipboardList, color: 'text-blue-500' },
          { label: 'Active Agencies', value: '56', icon: Building2, color: 'text-green-500' },
          { label: 'Registered Customers', value: '892', icon: Users, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="text-sm text-muted-foreground">Recent actions and requests will appear here.</div>
        </div>
      </div>
    </div>
  );
}

function UserManagement({ title, role }: { title: string, role?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const url = role ? `/auth/users/?role=${role}` : `/auth/users/`;
        const res = await api.get(url);
        setUsers(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [role]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-xs font-mono">{u.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-6 py-4">{u.role}</td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="text-green-600 font-medium">Verified</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequestsManagement({ title, type }: { title: string, type?: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const url = type ? `/travel-requests/?request_type__in=${type}` : `/travel-requests/`;
        const res = await api.get(url);
        setRequests(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [type]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Req ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No requests found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-xs font-mono">{r.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-medium">{r.request_type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{r.agency ? r.agency.company_name : r.customer ? r.customer.email : 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Settings className="w-5 h-5"/> General Configuration</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
              <input type="text" disabled value="Al-Rabb Tours Dashboard" className="w-full p-2.5 bg-secondary/50 border border-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Support Email</label>
              <input type="text" disabled value="support@alrabbtours.com" className="w-full p-2.5 bg-secondary/50 border border-border rounded-lg" />
            </div>
          </div>
          <button disabled className="bg-primary/50 text-primary-foreground px-4 py-2 rounded-lg font-medium cursor-not-allowed">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Admin Notifications</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 text-center py-12">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No new notifications</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">System alerts and request updates will appear here.</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="agencies" element={<UserManagement title="Agencies Management" role="AGENCY" />} />
        <Route path="customers" element={<UserManagement title="Customers Management" role="CUSTOMER" />} />
        <Route path="requests" element={<RequestsManagement title="All Requests" />} />
        <Route path="visas" element={<RequestsManagement title="Visa Requests" type="GROUP_VISA,INDIVIDUAL_VISA" />} />
        <Route path="tickets" element={<RequestsManagement title="Ticket Requests" type="AIR_TICKET" />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
