import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns, getInternById } from '@/lib/internService';
import { logAttendance } from '@/lib/attendanceService';
import { ScanLine, Clock, CheckCircle2, Camera, Loader2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScan() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScan, setLastScan] = useState<{ name: string; action: string; time: string } | null>(null);
  const [manualId, setManualId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  const scanMutation = useMutation({
    mutationFn: logAttendance,
    onSuccess: () => {
      // Pinapa-refresh ang attendance data pag may nag-scan
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    if (scannerActive) {
      html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        async (decodedText) => {
          setScannerActive(false);
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

  const handleScan = async (internId: string) => {
    if (scanMutation.isPending) return;
    
    try {
      const intern = await getInternById(internId);
      if (!intern) {
        toast.error('Intern not found / Invalid QR Code');
        return;
      }
      
      const result = await scanMutation.mutateAsync(intern.id);
      const action = result.action === 'time_in' ? 'Timed In' : 'Timed Out';
      
      setLastScan({
        name: intern.fullName,
        action,
        time: result.action === 'time_in' ? result.record.timeIn! : result.record.timeOut!,
      });
      
      toast.success(`${intern.fullName} — ${action}`);
    } catch (error) {
      toast.error('Error logging attendance.');
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
          <p className="text-muted-foreground">Loading Scanner...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">QR Scan Station</h1>
        <p className="text-muted-foreground text-sm mt-1">Scan intern QR codes for attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-xl p-8 text-center relative overflow-hidden">
          {scanMutation.isPending && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
          )}
          
          <div className="w-full max-w-[300px] aspect-square mx-auto rounded-2xl border-4 border-dashed border-brand-orange/30 flex items-center justify-center bg-muted/20 mb-6 overflow-hidden relative">
            {scannerActive ? (
              <>
                <div id="qr-reader" className="w-full h-full object-cover"></div>
                <Button onClick={() => setScannerActive(false)} variant="destructive" size="icon" className="absolute top-2 right-2 z-10 rounded-full"><StopCircle size={20} /></Button>
              </>
            ) : (
              <div className="text-center p-6">
                <Camera size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium mb-4">Camera Ready</p>
                <Button onClick={() => setScannerActive(true)} className="gradient-brand text-primary-foreground">Start Scanner</Button>
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto mt-6">
            <Input value={manualId} onChange={e => setManualId(e.target.value)} placeholder="Enter Intern ID (e.g. CAP-2026-0001)" disabled={scanMutation.isPending} />
            <Button type="submit" disabled={scanMutation.isPending} className="gradient-brand text-primary-foreground hover:opacity-90 shrink-0"><ScanLine size={16} /></Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2">Manual Quick Select:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {interns.filter(i => i.status === 'Active').slice(0, 6).map(intern => (
                <button key={intern.id} onClick={() => handleScan(intern.id)} disabled={scanMutation.isPending} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-brand-orange hover:text-primary-foreground transition-colors disabled:opacity-50">
                  {intern.fullName}
                </button>
              ))}
              {interns.length === 0 && <span className="text-xs text-muted-foreground">No active interns</span>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-xl p-8 text-center">
            <Clock size={24} className="text-brand-orange mx-auto mb-2" />
            <p className="text-4xl font-display font-bold text-foreground">{currentTime.toLocaleTimeString('en-US', { hour12: true })}</p>
            <p className="text-sm text-muted-foreground mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {lastScan && (
            <div className="glass-card rounded-xl p-6 border-l-4 border-l-success animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="text-success" size={24} />
                <h3 className="font-display font-semibold text-foreground">Last Scan</h3>
              </div>
              <p className="text-lg font-semibold text-foreground">{lastScan.name}</p>
              <p className="text-sm text-muted-foreground">{lastScan.action} at {lastScan.time}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}