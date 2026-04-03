import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getAttendance } from '@/lib/attendanceService';
import { getInterns } from '@/lib/internService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Download, Search, Loader2, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { toast } from 'sonner';

// ⚡ 8 AM to 6 PM LATE CHECKER LOGIC ⚡
const checkScheduleStatus = (timeIn: string | null, timeOut: string | null) => {
  if (!timeIn) return null;
  let isLate = false;
  let isEarlyOut = false;

  try {
    const parseMins = (t: string) => {
      const [time, period] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const inMins = parseMins(timeIn);
    if (inMins > (8 * 60)) isLate = true; // Late kapag lagpas 8:00 AM

    if (timeOut) {
      const outMins = parseMins(timeOut);
      if (outMins < (18 * 60)) isEarlyOut = true; // Early out kapag bago mag 6:00 PM (18:00)
    }

    if (isLate && isEarlyOut) return { text: "Late & Early Out", color: "text-destructive bg-destructive/10" };
    if (isLate) return { text: "Late", color: "text-warning bg-warning/10" };
    if (isEarlyOut) return { text: "Early Out", color: "text-orange-500 bg-orange-500/10" };
    return { text: "On Time", color: "text-success bg-success/10" };
  } catch (e) {
    return null;
  }
};

export default function AttendancePage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: attendance = [], isLoading: loadingAtt } = useQuery({ queryKey: ['attendance'], queryFn: getAttendance });
  const { data: interns = [], isLoading: loadingInt } = useQuery({ queryKey: ['interns'], queryFn: getInterns });
  const isLoading = loadingAtt || loadingInt;

  useEffect(() => { setCurrentPage(1); }, [search, dateFilter]);

  const filtered = useMemo(() => {
    return attendance.filter(r => {
        const matchesDate = !dateFilter || r.date === dateFilter;
        const intern = interns.find(i => i.id === r.internId);
        const matchesSearch = !search || intern?.fullName.toLowerCase().includes(search.toLowerCase()) || intern?.internId.toLowerCase().includes(search.toLowerCase());
        return matchesDate && matchesSearch;
      }).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, dateFilter, search, interns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const calcHours = (timeIn: string | null, timeOut: string | null) => {
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
      return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    } catch { return '—'; }
  };

  const exportCSV = () => {
    const headers = 'Date,Intern ID,Name,Time In,Time Out,Hours,Punctuality\n';
    const rows = filtered.map(r => {
      const intern = interns.find(i => i.id === r.internId);
      const punctuality = checkScheduleStatus(r.timeIn, r.timeOut);
      return `${r.date},${intern?.internId},${intern?.fullName},${r.timeIn || ''},${r.timeOut || ''},${calcHours(r.timeIn, r.timeOut)},${punctuality ? punctuality.text : ''}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intern-attendance-${dateFilter || 'all-time'}.csv`;
    a.click();
    toast.success(`Exported ${filtered.length} records!`);
  };

  if (isLoading) return <DashboardLayout><div className="flex justify-center h-[60vh] items-center"><Loader2 className="animate-spin text-brand-orange" size={48} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><CalendarCheck size={28} className="text-brand-orange"/> Intern Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Official Schedule: 8:00 AM - 6:00 PM (Mon-Sat)</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-auto rounded-xl" />
          {dateFilter && <Button variant="ghost" size="icon" onClick={() => setDateFilter('')} className="text-muted-foreground hover:text-destructive rounded-xl"><X size={18} /></Button>}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Time In</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Time Out</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Hours</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Punctuality</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(record => {
                const intern = interns.find(i => i.id === record.internId);
                const punctuality = checkScheduleStatus(record.timeIn, record.timeOut);
                
                return (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-600">{record.date}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">{intern?.fullName || 'Unknown'}</td>
                    <td className="py-3 px-6 text-slate-600">{record.timeIn || '—'}</td>
                    <td className="py-3 px-6 text-slate-600">{record.timeOut || '—'}</td>
                    <td className="py-3 px-6 font-medium text-slate-700">{calcHours(record.timeIn, record.timeOut)}</td>
                    <td className="py-3 px-6">
                      {punctuality && (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${punctuality.color}`}>
                          {punctuality.text}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <CalendarCheck size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No attendance records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-border/50">
            <p className="text-xs text-slate-500 font-medium">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg"><ChevronLeft size={16} /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 rounded-lg"><ChevronRight size={16} /></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}