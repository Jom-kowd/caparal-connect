import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns, getInternById } from '@/lib/internService';
import { logAttendance } from '@/lib/attendanceService';
import { ScanLine, Clock, CheckCircle2, Camera, Loader2, StopCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

// Interface para sa Last Scan
interface ScanResult {
  name: string;
  action: string;
  time: string;
  type: 'time_in' | 'time_out';
}

export default function QrScan() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [manualId, setManualId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  // ⚡ AUDIO BEEP FUNCTION (No MP3 needed, uses browser's synth)
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime); // Pitch ng Beep
      gain.gain.setValueAtTime(0.1, ctx.currentTime); // Volume
      osc.start();
      osc.stop(ctx.currentTime + 0.1); // Gaano katagal (100ms)
    } catch (e) {
      console.log("Audio play blocked by browser");
    }
  }, []);

  // Clock Timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Interns
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  // Attendance Mutation
  const scanMutation = useMutation({
    mutationFn: logAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  // QR Scanner Initialization
  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    if (scannerActive) {
      html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          setScannerActive(false); // Stop scanning to prevent spam
          const urlParts = decodedText.split('/');
          await handleScan(urlParts[urlParts.length - 1]);
        },
        () => {}
      ).catch(() => {
        toast.error("Failed to start camera. Please check permissions.");
        setScannerActive(false);
      });
    }
    return () => {
      if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop().catch(console.error);
    };
  }, [scannerActive]);

  // Main Handle Scan Logic
  const handleScan = async (internId: string) => {
    if (scanMutation.isPending) return;
    
    try {
      const intern = await getInternById(internId);
      if (!intern) {
        toast.error('Intern not found / Invalid QR Code');
        return;
      }
      
      const result = await scanMutation.mutateAsync(intern.id);
      playBeep(); // Play sound effect on success!
      
      const isTimeIn = result.action === 'time_in';
      const actionText = isTimeIn ? 'Timed In' : 'Timed Out';
      
      setLastScan({
        name: intern.fullName,
        action: actionText,
        time: isTimeIn ? result.record.timeIn! : result.record.timeOut!,
        type: result.action
      });
      
      toast.success(`${intern.fullName} — ${actionText}`);
    } catch (error) {
      toast.error('Error logging attendance. Please try again.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId || scanMutation.isPending) return;
    
    const intern = interns.find(i => i.id === manualId || i.internId.toUpperCase() === manualId.toUpperCase());
    if (intern) {
      await handleScan(intern.id);
      setManualId('');
    } else {
      toast.error('Intern not found. Check ID.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing Scanner...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">QR Scan Station</h1>
          <p className="text-muted-foreground text-sm mt-1">Point the intern's QR code at the camera to log attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT: SCANNER PANEL --- */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-sm border border-border/50">
          {/* Overlay for processing state */}
          {scanMutation.isPending && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-all duration-300">
              <Loader2 className="animate-spin text-brand-orange mb-3" size={48} />
              <p className="font-bold text-foreground text-lg tracking-wider">PROCESSING...</p>
            </div>
          )}
          
          {/* Camera Frame */}
          <div className={`w-full max-w-[340px] aspect-square mx-auto rounded-3xl border-[6px] border-dashed flex items-center justify-center bg-slate-100 dark:bg-slate-900 mb-8 overflow-hidden relative transition-all duration-500 ${scannerActive ? 'border-brand-orange shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]' : 'border-slate-300 dark:border-slate-700'}`}>
            {scannerActive ? (
              <>
                <div id="qr-reader" className="w-full h-full object-cover"></div>
                <div className="absolute inset-0 pointer-events-none border-[4px] border-brand-orange/50 rounded-2xl animate-pulse"></div>
                <Button 
                  onClick={() => setScannerActive(false)} 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-4 right-4 z-10 rounded-full shadow-lg"
                >
                  <StopCircle size={22} />
                </Button>
              </>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Camera size={36} className="text-slate-400" />
                </div>
                <p className="text-sm text-foreground font-bold mb-5 tracking-wide uppercase">Camera Standby</p>
                <Button onClick={() => setScannerActive(true)} size="lg" className="gradient-brand text-primary-foreground font-bold shadow-lg shadow-brand-orange/20 rounded-xl px-8">
                  ACTIVATE SCANNER
                </Button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto mt-2">
            <Input 
              value={manualId} 
              onChange={e => setManualId(e.target.value)} 
              placeholder="Or enter ID (e.g. CAP-2026-0001)" 
              disabled={scanMutation.isPending}
              className="rounded-xl border-2 text-center font-mono placeholder:font-sans"
            />
            <Button type="submit" disabled={scanMutation.isPending || !manualId} className="gradient-brand text-primary-foreground hover:opacity-90 shrink-0 rounded-xl px-6">
              <ScanLine size={18} />
            </Button>
          </form>

          {/* Quick Select Buttons */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">Manual Quick Select (Active Interns):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {interns.filter(i => i.status === 'Active').slice(0, 8).map(intern => (
                <button 
                  key={intern.id} 
                  onClick={() => handleScan(intern.id)} 
                  disabled={scanMutation.isPending} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-brand-orange hover:text-white transition-all disabled:opacity-50 border border-slate-200 dark:border-slate-700 hover:border-brand-orange"
                >
                  {intern.fullName.split(' ')[0]} {/* First name only for space */}
                </button>
              ))}
              {interns.filter(i => i.status === 'Active').length === 0 && (
                <span className="text-sm text-muted-foreground italic">No active interns found</span>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: STATUS PANEL --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clock Widget */}
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Clock size={120} />
            </div>
            <Clock size={28} className="text-brand-orange mx-auto mb-3" />
            <p className="text-5xl font-display font-black text-foreground tracking-tight">
              {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-widest">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* Last Scan Widget - DYNAMIC COLORS */}
          {lastScan ? (
            <div className={`rounded-2xl p-6 border-l-[6px] shadow-lg animate-fade-in transition-all ${
              lastScan.type === 'time_in' 
                ? 'bg-success/5 border-l-success shadow-success/10' 
                : 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500 shadow-blue-500/10'
            }`}>
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  {lastScan.type === 'time_in' ? (
                    <CheckCircle2 className="text-success" size={20} />
                  ) : (
                    <LogOut className="text-blue-500" size={20} />
                  )}
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${lastScan.type === 'time_in' ? 'text-success' : 'text-blue-500'}`}>
                    Last Scan Success
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-black/5 px-2 py-1 rounded uppercase">Just Now</span>
              </div>
              
              <p className="text-xl font-black text-foreground leading-tight">{lastScan.name}</p>
              
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white ${
                  lastScan.type === 'time_in' ? 'bg-success' : 'bg-blue-500'
                }`}>
                  {lastScan.action}
                </span>
                <span className="text-sm font-medium text-muted-foreground">at {lastScan.time}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-8 border-2 border-dashed border-border/60 bg-muted/20 text-center flex flex-col items-center justify-center h-48 opacity-70">
              <ScanLine size={32} className="text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">Waiting for scan...</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}