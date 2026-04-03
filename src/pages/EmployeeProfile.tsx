import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEmployeeById } from '@/lib/employeeService';
import { getAttendanceForEmployee } from '@/lib/employeeAttendanceService';
import { QRCodeSVG } from 'qrcode.react';
import { UserCircle, Building, Calendar, Loader2, ShieldCheck, MapPin, Briefcase } from 'lucide-react';

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: employee, isLoading: loadingEmp } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id!),
    enabled: !!id
  });

  const { data: attendance = [], isLoading: loadingAtt } = useQuery({
    queryKey: ['emp_attendance', id],
    queryFn: () => getAttendanceForEmployee(id!),
    enabled: !!id
  });

  if (loadingEmp || loadingAtt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
        <p className="text-slate-500 font-medium tracking-wide animate-pulse">Loading Digital Profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl">
          <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-display font-bold text-slate-800">Employee Not Found</h1>
          <p className="text-slate-500 mt-2 text-sm">The digital profile you scanned does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isActive = employee.status === 'Active';
  const isOnLeave = employee.status === 'On Leave';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 pt-10 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-orange"></div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-1">Official Digital ID</p>
        <h1 className="text-2xl font-display font-black text-white tracking-tight">
          <span className="text-brand-orange">Caparal</span> Appliances
        </h1>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto -mt-12 px-4 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
          
          {/* Profile Photo */}
          <div className="flex justify-center pt-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-orange rounded-full blur-md opacity-20"></div>
              {employee.photo ? (
                <img src={employee.photo} alt={employee.fullName} className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-slate-100" />
              ) : (
                <div className="relative w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserCircle size={64} className="text-slate-300" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                 <div className={`p-1.5 rounded-full border-2 border-white shadow-sm ${isActive ? 'bg-success' : isOnLeave ? 'bg-blue-500' : 'bg-slate-400'}`}>
                   <ShieldCheck size={16} className="text-white" />
                 </div>
              </div>
            </div>
          </div>

          {/* Identity Section */}
          <div className="text-center px-6 pt-5 pb-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">
              {employee.fullName}
            </h2>
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 mb-3">
               <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange">
                 {employee.position}
               </span>
            </div>
            <div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                isActive ? 'bg-success/15 text-success border border-success/20' : 
                isOnLeave ? 'bg-blue-500/15 text-blue-600 border border-blue-500/20' : 
                'bg-slate-200 text-slate-500 border border-slate-300'
              }`}>
                {employee.status} Employee
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-8 py-6 space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg"><Briefcase size={18} className="text-slate-400" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Role / Position</p>
                <p className="text-sm font-semibold text-slate-700">{employee.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg"><Building size={18} className="text-slate-400" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Department</p>
                <p className="text-sm font-semibold text-slate-700">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={18} className="text-slate-400" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date Registered</p>
                <p className="text-sm font-semibold text-slate-700">{new Date(employee.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="px-6 py-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-800">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <QRCodeSVG value={`${window.location.origin}/employee/${employee.id}`} size={120} fgColor="#0f172a" bgColor="transparent" />
            </div>
            <p className="font-mono text-sm font-bold text-slate-500 tracking-widest mt-4">
              {employee.employeeId}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Scan for Attendance</p>
          </div>

          {/* Attendance History */}
          {attendance.length > 0 && (
            <div className="px-6 py-6 bg-white dark:bg-slate-900">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Logs</h3>
              <div className="space-y-2">
                {attendance.slice(0, 3).map(a => (
                  <div key={a.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">{a.date}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{a.timeIn}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{a.timeOut ? `Out: ${a.timeOut}` : 'Currently Clocked In'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="px-6 py-4 bg-slate-900 text-center flex items-center justify-center gap-2">
             <MapPin size={12} className="text-slate-400" />
             <p className="text-[9px] text-slate-400 font-medium tracking-wide">Brgy. Fundado, Labo, Camarines Norte</p>
          </div>

        </div>
      </div>
    </div>
  );
}