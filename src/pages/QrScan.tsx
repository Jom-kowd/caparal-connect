import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { logAttendance, getInternById, getInterns } from '@/lib/store';
import { Intern } from '@/lib/types';
import { ScanLine, Clock, CheckCircle2, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function QrScan() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScan, setLastScan] = useState<{ name: string; action: string; time: string } | null>(null);
  const [manualId, setManualId] = useState('');
  
  // Mga bagong states para sa Firebase
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Oras
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Pagkuha ng mga interns pag-load ng pahina
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const data = await getInterns();
        setInterns(data);
      } catch (error) {
        toast.error("Failed to load interns");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterns();
  }, []);

  // Ginawang async ang handleScan
  const handleScan = async (internId: string) => {
    if (isProcessing) return; // Iwas double-scan
    setIsProcessing(true);
    
    try {
      const intern = await getInternById(internId);
      if (!intern) {
        toast.error('Intern not found');
        return;
      }
      
      const result = await logAttendance(intern.id);
      const action = result.action === 'time_in' ? 'Timed In' : 'Timed Out';
      
      setLastScan({
        name: intern.fullName,
        action,
        time: result.action === 'time_in' ? result.record.timeIn! : result.record.timeOut!,
      });
      
      toast.success(`${intern.fullName} — ${action}`);
    } catch (error) {
      toast.error('Error logging attendance. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId || isProcessing) return;
    
    // Hanapin ang intern sa loaded na listahan
    const intern = interns.find(i => i.id === manualId || i.internId.toUpperCase() === manualId.toUpperCase());
    
    if (intern) {
      await handleScan(intern.id);
      setManualId(''); // I-clear ang input pagkatapos
    } else {
      toast.error('Intern not found. Please check the ID.');
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
        {/* Scanner area */}
        <div className="glass-card rounded-xl p-8 text-center relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
          )}
          
          <div className="w-64 h-64 mx-auto rounded-2xl border-4 border-dashed border-brand-orange/30 flex items-center justify-center bg-muted/20 mb-6">
            <div className="text-center">
              <Camera size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Camera scanner coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Use manual entry below</p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto">
            <Input
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              placeholder="Enter Intern ID (e.g. CAP-2026-0001)"
              disabled={isProcessing}
            />
            <Button type="submit" disabled={isProcessing} className="gradient-brand text-primary-foreground hover:opacity-90 shrink-0">
              <ScanLine size={16} />
            </Button>
          </form>

          {/* Quick select */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {interns.filter(i => i.status === 'Active').slice(0, 6).map(intern => (
                <button
                  key={intern.id}
                  onClick={() => handleScan(intern.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-brand-orange hover:text-primary-foreground transition-colors disabled:opacity-50"
                >
                  {intern.fullName}
                </button>
              ))}
              {interns.length === 0 && (
                <span className="text-xs text-muted-foreground">No active interns</span>
              )}
            </div>
          </div>
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          {/* Clock */}
          <div className="glass-card rounded-xl p-8 text-center">
            <Clock size={24} className="text-brand-orange mx-auto mb-2" />
            <p className="text-4xl font-display font-bold text-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Last scan result */}
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