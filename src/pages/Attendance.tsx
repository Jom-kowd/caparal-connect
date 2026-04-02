import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getAttendance } from '@/lib/attendanceService';
import { getInterns } from '@/lib/internService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Download, Search, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  
  // ⚡ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: attendance = [], isLoading: loadingAtt } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance
  });

  const { data: interns = [], isLoading: loadingInt } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  const isLoading = loadingAtt || loadingInt;

  // I-reset ang page sa 1 tuwing nagbabago ang search o date
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter]);

  const filtered = useMemo(() => {
    return attendance
      .filter(r => {
        const matchesDate = !dateFilter || r.date === dateFilter;
        const intern = interns.find(i => i.id === r.internId);
        const matchesSearch = !search || 
          intern?.fullName.toLowerCase().includes(search.toLowerCase()) || 
          intern?.internId.toLowerCase().includes(search.toLowerCase());
        return matchesDate && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, dateFilter, search, interns]);

  // ⚡ PAGINATION LOGIC
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    // Gagamitin ang `filtered` imbes na `paginatedData` para ma-export LAHAT
    const rows = filtered.map(r => {
      const intern = interns.find(i => i.id === r.internId);
      return `${r.date},${intern?.internId},${intern?.fullName},${r.timeIn || ''},${r.timeOut || ''},${calcHours(r.timeIn, r.timeOut)}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${dateFilter || 'all-time'}.csv`;
    a.click();
    toast.success(`Exported ${filtered.length} records!`);
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
          <h1 className="text-3xl font-display font-bold text-foreground">Attendance Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Showing {filtered.length} total records</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors">
          <Download size={16} /> Export to CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by intern name or ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10 rounded-xl" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)} 
            className="w-auto rounded-xl" 
          />
          {dateFilter && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDateFilter('')} 
              title="Clear Date Filter"
              className="text-muted-foreground hover:text-destructive rounded-xl"
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Intern ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Time In</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Time Out</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Hours</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(record => {
                const intern = interns.find(i => i.id === record.internId);
                return (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-600">{record.date}</td>
                    <td className="py-3 px-6 font-mono text-xs font-bold text-brand-orange">{intern?.internId}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">{intern?.fullName || 'Unknown Intern'}</td>
                    <td className="py-3 px-6 text-slate-600">{record.timeIn || '—'}</td>
                    <td className="py-3 px-6 text-slate-600">{record.timeOut || '—'}</td>
                    <td className="py-3 px-6 font-medium text-slate-700">{calcHours(record.timeIn, record.timeOut)}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.timeOut ? 'bg-success/15 text-success border border-success/20' : 'bg-warning/15 text-warning border border-warning/20'
                      }`}>
                        {record.timeOut ? 'Completed' : 'Clocked In'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarCheck size={40} className="mb-3 opacity-20" />
                      <p className="font-medium text-slate-500">No attendance records found</p>
                      <p className="text-xs mt-1 opacity-70">Try adjusting your search or date filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ⚡ PAGINATION CONTROLS */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-border/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> entries
            </p>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-lg"
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="text-xs font-semibold text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}