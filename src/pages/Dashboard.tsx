import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { getInterns } from '@/lib/internService';
import { getAttendance } from '@/lib/attendanceService';
import { getEmployees } from '@/lib/employeeService';
import { getEmployeeAttendance } from '@/lib/employeeAttendanceService';
import { Users, UserCheck, CalendarCheck, Briefcase, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];

  // ⚡ Kukunin na natin pareho ang data ng Intern at Employee
  const { data: interns = [], isLoading: loadInt } = useQuery({ queryKey: ['interns'], queryFn: getInterns });
  const { data: employees = [], isLoading: loadEmp } = useQuery({ queryKey: ['employees'], queryFn: getEmployees });
  const { data: intAtt = [], isLoading: loadIntAtt } = useQuery({ queryKey: ['attendance'], queryFn: getAttendance });
  const { data: empAtt = [], isLoading: loadEmpAtt } = useQuery({ queryKey: ['emp_attendance'], queryFn: getEmployeeAttendance });

  const isLoading = loadInt || loadEmp || loadIntAtt || loadEmpAtt;

  // ⚡ Compute Unified Stats
  const stats = useMemo(() => {
    const activeInt = interns.filter(i => i.status === 'Active').length;
    const activeEmp = employees.filter(e => e.status === 'Active').length;
    const todayInt = intAtt.filter(a => a.date === today);
    const todayEmp = empAtt.filter(a => a.date === today);

    // Pagsasamahin ang logs para sa "Today's Logs" widget
    const combinedLogs = [
      ...todayInt.map(a => {
        const p = interns.find(i => i.id === a.internId);
        return { id: a.id, name: p?.fullName, timeIn: a.timeIn, timeOut: a.timeOut, role: 'Intern' };
      }),
      ...todayEmp.map(a => {
        const p = employees.find(e => e.id === a.employeeId);
        return { id: a.id, name: p?.fullName, timeIn: a.timeIn, timeOut: a.timeOut, role: 'Employee' };
      })
    ].reverse(); // Simpleng reverse para mas mauna ang pinakabago

    return {
      totalWorkforce: interns.length + employees.length,
      activeInt,
      activeEmp,
      presentToday: todayInt.length + todayEmp.length,
      logs: combinedLogs
    };
  }, [interns, employees, intAtt, empAtt, today]);

  // ⚡ Stacked Chart Data
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        Interns: intAtt.filter(a => a.date === dateStr).length,
        Employees: empAtt.filter(a => a.date === dateStr).length
      });
    }
    return days;
  }, [intAtt, empAtt]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-brand-orange" size={48} /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Workforce Overview</h1>
        <p className="text-muted-foreground mt-1">Caparal HRIS & Company Analytics</p>
      </div>

      {/* Pinagsamang Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Headcount" value={stats.totalWorkforce} icon={Users} variant="brand" />
        <StatCard title="Active Employees" value={stats.activeEmp} icon={Briefcase} variant="info" />
        <StatCard title="Active Interns" value={stats.activeInt} icon={UserCheck} variant="default" />
        <StatCard title="Present Today" value={stats.presentToday} icon={CalendarCheck} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Bar Chart */}
        <div className="glass-card rounded-xl p-6 lg:col-span-2">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">7-Day Attendance Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} contentStyle={{ borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Employees" stackId="a" fill="#0f172a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Interns" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pinagsamang Logs */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Today's Logs</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {stats.logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No records for today.</p>
            ) : (
              stats.logs.map((record, i) => (
                <div key={`${record.id}-${i}`} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{record.name}</p>
                      {/* Badge para matukoy agad kung Employee o Intern ang nag time-in */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${record.role === 'Employee' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'}`}>
                        {record.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{record.timeIn}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${record.timeOut ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {record.timeOut ? 'OUT' : 'IN'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}