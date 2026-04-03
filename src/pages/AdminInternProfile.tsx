import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getInternById } from '@/lib/internService';
import { getAttendanceForIntern } from '@/lib/attendanceService';
import { ArrowLeft, UserCircle, Briefcase, Calendar, Phone, GraduationCap, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminInternProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: intern, isLoading: loadInt } = useQuery({
    queryKey: ['intern', id],
    queryFn: () => getInternById(id!),
    enabled: !!id
  });

  const { data: attendance = [], isLoading: loadAtt } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => getAttendanceForIntern(id!),
    enabled: !!id
  });

  if (loadInt || loadAtt) return <DashboardLayout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={48} /></div></DashboardLayout>;
  if (!intern) return <DashboardLayout><div className="text-center mt-20"><h2>Intern Not Found</h2></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/interns">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground mb-4 pl-0">
            <ArrowLeft size={16} /> Back to Directory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Profile Info */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-orange/80 to-amber-500/80"></div>
            <div className="relative z-10 flex justify-center mt-4 mb-4">
              <div className="p-1 bg-white rounded-full shadow-md">
                {intern.photo ? (
                  <img src={intern.photo} alt={intern.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
                ) : (
                  <UserCircle size={96} className="text-slate-300 bg-slate-50 rounded-full" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">{intern.fullName}</h2>
            <p className="text-brand-orange font-mono text-sm font-bold mt-1">{intern.internId}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${intern.status === 'Active' ? 'bg-success/15 text-success' : 'bg-slate-100 text-slate-500'}`}>
              {intern.status}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-border pb-2 mb-4">Personal Details</h3>
            <div className="flex items-center gap-3 text-sm"><Briefcase size={16} className="text-muted-foreground" /><span className="font-medium">{intern.department}</span></div>
            <div className="flex items-center gap-3 text-sm"><GraduationCap size={16} className="text-muted-foreground" /><span className="font-medium">{intern.course} - {intern.school}</span></div>
            {intern.contactNumber && <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-muted-foreground" /><span className="font-medium">{intern.contactNumber}</span></div>}
            <div className="flex items-center gap-3 text-sm"><Calendar size={16} className="text-muted-foreground" /><span className="font-medium">{intern.startDate} to {intern.endDate}</span></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Attendance Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-border/50 text-center">
              <Calendar className="mx-auto text-brand-orange mb-2" size={24} />
              <p className="text-3xl font-black text-foreground">{attendance.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Days Present</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border/50 text-center">
              <Clock className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="text-3xl font-black text-foreground">{attendance.filter(a => a.timeOut).length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Completed Shifts</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Attendance History</h3>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
              {attendance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No attendance records found.</p>
              ) : (
                attendance.map(record => (
                  <div key={record.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/50">
                    <div>
                      <p className="font-bold text-sm text-foreground">{record.date}</p>
                      <p className="text-xs text-muted-foreground mt-1">In: {record.timeIn}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${record.timeOut ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {record.timeOut ? 'Completed' : 'Active Shift'}
                      </span>
                      {record.timeOut && <p className="text-xs text-muted-foreground mt-1">Out: {record.timeOut}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}