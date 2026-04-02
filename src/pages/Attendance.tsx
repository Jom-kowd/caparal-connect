import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getAttendance } from '@/lib/attendanceService';
import { getInterns } from '@/lib/internService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Download, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const { data: attendance = [], isLoading: loadingAtt } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance
  });

  const { data: interns = [], isLoading: loadingInt } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  const isLoading = loadingAtt || loadingInt;

  const filtered = useMemo(() => {
    return attendance
      .filter(r => {
        const matchesDate = !dateFilter || r.date === dateFilter;
        const intern = interns.find(i => i.id === r.internId);
        const matchesSearch = !search || intern?.fullName.toLowerCase().includes(search.toLowerCase()) || intern?.internId.toLowerCase().includes(search.toLowerCase());
        return matchesDate && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, dateFilter, search, interns]);

  const calcHours = (timeIn: string | null, timeOut: string | null): string => {
    if (!timeIn || !timeOut) return '—';
    try {
      const parse = (t: string) => {
        const [time, period] = t.split(' ');
        const [h, m, s] = time.split(':').map(Number);
        let hour = h;
        if (period === 'PM' && h !== 12) hour += 12;
        if (period === 'AM' && h === 12) hour = 0;
        return hour * 3600 + m * 60 + (s || 0);
      };
      const diff = parse(timeOut) - parse(timeIn);
      if (diff <= 0) return '—';
      const hours = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      return `${hours}h ${mins}m`;
    } catch {
      return '—';
    }
  };

  const exportCSV = () => {
    const headers = 'Date,Intern ID,Name,Time In,Time Out,Hours\n';
    const rows = filtered.map(r => {
      const intern = interns.find(i => i.id === r.internId);
      return `${r.date},${intern?.internId},${intern?.fullName},${r.timeIn || ''},${r.timeOut || ''},${calcHours(r.timeIn, r.timeOut)}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${dateFilter || 'all'}.csv`;
    a.click();
    toast.success('Attendance exported!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
          <p className="text-muted-foreground">Loading attendance records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} records</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search intern..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-auto" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Intern ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time In</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time Out</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hours</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => {
                const intern = interns.find(i => i.id === record.internId);
                return (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4 font-mono text-xs text-brand-orange">{intern?.internId}</td>
                    <td className="py-3 px-4 font-medium">{intern?.fullName || 'Unknown'}</td>
                    <td className="py-3 px-4">{record.timeIn || '—'}</td>
                    <td className="py-3 px-4">{record.timeOut || '—'}</td>
                    <td className="py-3 px-4 font-medium">{calcHours(record.timeIn, record.timeOut)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.timeOut ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {record.timeOut ? 'Complete' : 'Clocked In'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground"><CalendarCheck size={32} className="mx-auto mb-2 opacity-40" />No attendance records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}