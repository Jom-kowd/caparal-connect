import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { getInterns } from '@/lib/internService';
import { getAttendance } from '@/lib/attendanceService';
import { Users, UserCheck, CalendarCheck, Clock, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];

  // ⚡ REACT QUERY: Automatic caching, background sync, at loading states!
  const { data: interns = [], isLoading: loadingInterns } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance
  });

  const isLoading = loadingInterns || loadingAttendance;

  // Compute stats
  const stats = useMemo(() => {
    const active = interns.filter(i => i.status === 'Active').length;
    const todayAtt = attendance.filter(a => a.date === today);
    const onTime = todayAtt.filter(a => {
      if (!a.timeIn) return false;
      const [time, period] = a.timeIn.split(' ');
      const h = parseInt(time.split(':')[0]);
      const hour = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
      return hour < 9;
    }).length;

    return { total: interns.length, active, presentToday: todayAtt.length, onTime, todayAtt };
  }, [interns, attendance, today]);

  // Generate Data para sa Bar Chart (Last 7 Days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = attendance.filter(a => a.date === dateStr).length;
      days.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), present: count });
    }
    return days;
  }, [attendance]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-brand-orange" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Caparal Intern Management System Analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Interns" value={stats.total} icon={Users} variant="brand" />
        <StatCard title="Active Interns" value={stats.active} icon={UserCheck} variant="success" />
        <StatCard title="Present Today" value={stats.presentToday} icon={CalendarCheck} variant="info" />
        <StatCard title="On Time Today" value={stats.onTime} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <div className="glass-card rounded-xl p-6 lg:col-span-2">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">7-Day Attendance Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="present" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ATTENDANCE */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Today's Logs</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {stats.todayAtt.length === 0 ? (
              <p className="text-muted-foreground text-sm">No records for today.</p>
            ) : (
              stats.todayAtt.map(record => {
                const intern = interns.find(i => i.id === record.internId);
                return (
                  <div key={record.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{intern?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{record.timeIn}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${record.timeOut ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {record.timeOut ? 'OUT' : 'IN'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}