import { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { getInterns, getAttendanceForDate } from '@/lib/store';
import { Users, UserCheck, CalendarCheck, Clock } from 'lucide-react';

export default function Dashboard() {
  const interns = getInterns();
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getAttendanceForDate(today);

  const stats = useMemo(() => ({
    total: interns.length,
    active: interns.filter(i => i.status === 'Active').length,
    presentToday: todayAttendance.length,
    onTime: todayAttendance.filter(a => {
      if (!a.timeIn) return false;
      const [time, period] = a.timeIn.split(' ');
      const [h] = time.split(':').map(Number);
      const hour = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
      return hour < 9;
    }).length,
  }), [interns, todayAttendance]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to Caparal Intern Management System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Interns" value={stats.total} icon={Users} variant="brand" />
        <StatCard title="Active Interns" value={stats.active} icon={UserCheck} variant="success" />
        <StatCard title="Present Today" value={stats.presentToday} icon={CalendarCheck} variant="info" />
        <StatCard title="On Time Today" value={stats.onTime} icon={Clock} />
      </div>

      {/* Recent Attendance */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Today's Attendance</h2>
        {todayAttendance.length === 0 ? (
          <p className="text-muted-foreground text-sm">No attendance records for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Intern ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time In</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time Out</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map(record => {
                  const intern = interns.find(i => i.id === record.internId);
                  return (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">{intern?.internId}</td>
                      <td className="py-3 px-4 font-medium">{intern?.fullName || 'Unknown'}</td>
                      <td className="py-3 px-4">{record.timeIn || '—'}</td>
                      <td className="py-3 px-4">{record.timeOut || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.timeOut
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {record.timeOut ? 'Complete' : 'Clocked In'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
