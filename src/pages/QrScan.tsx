import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns, getInternById } from '@/lib/internService';
import { logAttendance } from '@/lib/attendanceService';
import { getEmployees, getEmployeeById } from '@/lib/employeeService';
import { logEmployeeAttendance } from '@/lib/employeeAttendanceService';
import { ScanLine, Clock, CheckCircle2, Camera, Loader2, StopCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanResult { name: string; action: string; time: string; type: 'time_in' | 'time_out'; role: 'Intern' | 'Employee' }

export default function QrScan() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [manualId, setManualId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [quickSelectRole, setQuickSelectRole] = useState<'intern' | 'employee'>('intern');

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) { console.log("Audio blocked"); }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: interns = [] } = useQuery({ queryKey: ['interns'], queryFn: getInterns });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: getEmployees });

  // Mutations
  const scanInternMutation = useMutation({ mutationFn: logAttendance, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }) });
  const scanEmployeeMutation = useMutation({ mutationFn: logEmployeeAttendance, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emp_attendance'] }) });

  const isProcessing = scanInternMutation.isPending || scanEmployeeMutation.isPending;

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    if (scannerActive) {
      html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          setScannerActive(false);
          const type = decodedText.includes('/employee/') ? 'employee' : 'intern';
          const idPart = decodedText.split('/').pop() || '';
          await handleScan(idPart, type);
        },
        () => {}
      ).catch(() => {
        toast.error("Failed to start camera. Please check permissions.");
        setScannerActive(false);
      });
    }
    return () => { if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop().catch(console.error); };
  }, [scannerActive]);

  // ⚡ THE UNIVERSAL SCAN HANDLER
  const handleScan = async (dbId: string, roleType: 'intern' | 'employee') => {
    if (isProcessing) return;
    try {
      let result, person;
      if (roleType === 'employee') {
        person = await getEmployeeById(dbId);
        if (!person) throw new Error('Employee not found');
        result = await scanEmployeeMutation.mutateAsync(person.id);
      } else {
        person = await getInternById(dbId);
        if (!person) throw new Error('Intern not found');
        result = await scanInternMutation.mutateAsync(person.id);
      }
      
      playBeep();
      const isTimeIn = result.action === 'time_in';
      const actionText = isTimeIn ? 'Timed In' : 'Timed Out';
      
      setLastScan({
        name: person.fullName,
        action: actionText,
        time: isTimeIn ? result.record.timeIn! : result.record.timeOut!,
        type: result.action,
        role: roleType === 'employee' ? 'Employee' : 'Intern'
      });
      toast.success(`${person.fullName} (${roleType === 'employee' ? 'Employee' : 'Intern'}) — ${actionText}`);
    } catch (error) {
      toast.error('Invalid QR Code or Record not found.');
    }
  };

  // ⚡ SMART MANUAL SUBMIT (Auto-detects EMP- or CAP-)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId || isProcessing) return;
    const upperId = manualId.toUpperCase();
    
    if (upperId.startsWith('EMP-')) {
      const emp = employees.find(e => e.employeeId.toUpperCase() === upperId);
      emp ? await handleScan(emp.id, 'employee') : toast.error('Employee not found.');
    } else {
      const intern = interns.find(i => i.internId.toUpperCase() === upperId);
      intern ? await handleScan(intern.id, 'intern') : toast.error('Intern not found.');
    }
    setManualId('');
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Universal QR Station</h1>
        <p className="text-muted-foreground text-sm mt-1">Scan Intern or Employee QR codes for attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"><Loader2 className="animate-spin text-brand-orange mb-3" size={48} /><p className="font-bold text-lg">PROCESSING...</p></div>}
          
          <div className={`w-full max-w-[340px] aspect-square mx-auto rounded-3xl border-[6px] border-dashed flex items-center justify-center bg-slate-100 dark:bg-slate-900 mb-8 relative transition-all ${scannerActive ? 'border-brand-orange shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]' : 'border-slate-300'}`}>
            {scannerActive ? (
              <><div id="qr-reader" className="w-full h-full object-cover"></div><div className="absolute inset-0 border-[4px] border-brand-orange/50 rounded-2xl animate-pulse pointer-events-none"></div><Button onClick={() => setScannerActive(false)} variant="destructive" size="icon" className="absolute top-4 right-4 z-10 rounded-full"><StopCircle size={22} /></Button></>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Camera size={36} className="text-slate-400" /></div>
                <p className="text-sm font-bold mb-5 tracking-wide uppercase">Camera Standby</p>
                <Button onClick={() => setScannerActive(true)} size="lg" className="gradient-brand text-white font-bold rounded-xl px-8">ACTIVATE SCANNER</Button>
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto mt-2">
            <Input value={manualId} onChange={e => setManualId(e.target.value)} placeholder="e.g. CAP-2026-0001 or EMP-2026-0001" disabled={isProcessing} className="rounded-xl border-2 text-center font-mono placeholder:font-sans" />
            <Button type="submit" disabled={isProcessing || !manualId} className="gradient-brand text-white rounded-xl px-6"><ScanLine size={18} /></Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manual Quick Select:</p>
              <div className="flex gap-2">
                <button onClick={() => setQuickSelectRole('intern')} className={`text-xs font-bold px-2 py-1 rounded ${quickSelectRole === 'intern' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'}`}>Interns</button>
                <button onClick={() => setQuickSelectRole('employee')} className={`text-xs font-bold px-2 py-1 rounded ${quickSelectRole === 'employee' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'}`}>Employees</button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSelectRole === 'intern' && interns.filter(i => i.status === 'Active').slice(0, 8).map(i => (
                <button key={i.id} onClick={() => handleScan(i.id, 'intern')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-brand-orange hover:text-white transition-all border border-slate-200">{i.fullName.split(' ')[0]}</button>
              ))}
              {quickSelectRole === 'employee' && employees.filter(e => e.status === 'Active').slice(0, 8).map(e => (
                <button key={e.id} onClick={() => handleScan(e.id, 'employee')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-brand-orange hover:text-white transition-all border border-slate-200">{e.fullName.split(' ')[0]}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50 relative overflow-hidden">
            <Clock size={28} className="text-brand-orange mx-auto mb-3" />
            <p className="text-5xl font-display font-black text-foreground tracking-tight">{currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-widest">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>

          {lastScan ? (
            <div className={`rounded-2xl p-6 border-l-[6px] shadow-lg animate-fade-in transition-all ${lastScan.type === 'time_in' ? 'bg-success/5 border-l-success' : 'bg-blue-50 border-l-blue-500'}`}>
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  {lastScan.type === 'time_in' ? <CheckCircle2 className="text-success" size={20} /> : <LogOut className="text-blue-500" size={20} />}
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${lastScan.type === 'time_in' ? 'text-success' : 'text-blue-500'}`}>Scan Success • {lastScan.role}</h3>
                </div>
              </div>
              <p className="text-xl font-black text-foreground leading-tight">{lastScan.name}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white ${lastScan.type === 'time_in' ? 'bg-success' : 'bg-blue-500'}`}>{lastScan.action}</span>
                <span className="text-sm font-medium text-muted-foreground">at {lastScan.time}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-8 border-2 border-dashed bg-muted/20 text-center h-48 opacity-70 flex flex-col items-center justify-center">
              <ScanLine size={32} className="text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">Waiting for scan...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}