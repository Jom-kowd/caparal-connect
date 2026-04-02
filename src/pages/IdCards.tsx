import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns } from '@/lib/store';
import { Intern } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { Download, UserCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export default function IdCards() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const data = await getInterns();
        const activeInterns = data.filter(i => i.status === 'Active');
        setInterns(activeInterns);
        if (activeInterns.length > 0) {
          setSelectedId(activeInterns[0].id);
        }
      } catch (error) {
        toast.error("Failed to load interns");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterns();
  }, []);

  const intern = interns.find(i => i.id === selectedId);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toast.loading('Generating high-quality ID...');
    
    try {
      // useCORS is required to download images hosted on Firebase/External URLs
      const canvas = await html2canvas(cardRef.current, { 
        scale: 4, // High resolution for printing
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });
      
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${intern?.internId || 'id-card'}.png`;
      a.click();
      
      toast.dismiss();
      toast.success('ID Card downloaded successfully!');
    } catch {
      toast.dismiss();
      toast.error('Failed to download card. Check image permissions.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
          <p className="text-muted-foreground">Loading ID Cards...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">ID Card Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate professional intern ID cards ready for PVC printing</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Selector Panel */}
        <div className="lg:w-80">
          <div className="glass-card p-6 rounded-2xl">
            <label className="text-xs font-bold text-muted-foreground mb-3 block uppercase tracking-wider">
              Select Intern
            </label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm mb-6 focus:border-brand-orange outline-none transition-colors font-medium"
            >
              {interns.length === 0 && <option value="">No active interns</option>}
              {interns.map(i => (
                <option key={i.id} value={i.id}>{i.fullName} ({i.internId})</option>
              ))}
            </select>
            
            {intern && (
              <Button 
                onClick={downloadCard} 
                disabled={isDownloading}
                className="w-full h-12 gradient-brand text-primary-foreground gap-2 hover:opacity-90 shadow-lg shadow-brand-orange/20 font-bold tracking-wide rounded-xl"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isDownloading ? 'GENERATING...' : 'DOWNLOAD ID CARD'}
              </Button>
            )}
          </div>
        </div>

        {/* Card Preview Area */}
        {intern && (
          <div className="flex-1 flex justify-center lg:justify-start">
            {/* ID CARD CONTAINER */}
            <div
              ref={cardRef}
              className="w-[340px] h-[540px] bg-white rounded-[16px] overflow-hidden shadow-2xl relative flex flex-col"
              style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}
            >
              {/* Header Banner - INAYOS ANG OVERLAP DITO */}
              {/* Nilagyan ng justify-start at pt-8 para pumunta sa itaas ang text */}
              <div className="w-full h-[145px] flex flex-col items-center justify-start pt-7 relative z-0" style={{ backgroundColor: '#0f172a' }}>
                <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: '#F97316' }}></div>
                
                <h2 className="text-[22px] font-black text-white tracking-tight flex items-center gap-2">
                  <span style={{ color: '#F97316' }}>Caparal</span> Appliances
                </h2>
                <p className="text-[9px] tracking-[0.2em] text-slate-300 font-semibold uppercase mt-1">
                  Home Style Depot Corp.
                </p>
              </div>

              {/* Profile Photo */}
              <div className="relative z-10 flex justify-center -mt-[50px] mb-4">
                <div className="p-1.5 bg-white rounded-full shadow-sm">
                  {intern.photo ? (
                    <img 
                      src={intern.photo} 
                      alt={intern.fullName} 
                      crossOrigin="anonymous"
                      className="w-[100px] h-[100px] rounded-full object-cover border-2 border-slate-100" 
                      style={{ backgroundColor: '#f8fafc' }}
                    />
                  ) : (
                    <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center border-2 border-slate-100" style={{ backgroundColor: '#f8fafc' }}>
                      <UserCircle size={56} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Information */}
              <div className="px-6 flex flex-col items-center text-center flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none" style={{ color: '#0f172a' }}>
                  {intern.fullName}
                </h3>
                
                <div className="mt-2.5 px-4 py-1 rounded-full border" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#ea580c' }}>
                    {intern.department}
                  </p>
                </div>
                
                <div className="mt-4 w-full">
                  <p className="text-[11px] font-bold uppercase tracking-wider leading-snug" style={{ color: '#64748b' }}>
                    {intern.course}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#94a3b8' }}>
                    {intern.school}
                  </p>
                </div>
              </div>

              {/* Bottom Layout (ID & QR) */}
              <div className="px-7 pb-8 w-full flex items-end justify-between mt-auto">
                <div className="flex flex-col items-start pb-1">
                  <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>
                    Intern ID No.
                  </p>
                  <p className="font-mono text-base font-bold px-2 py-0.5 rounded border" style={{ color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    {intern.internId}
                  </p>
                  <div className="flex items-center gap-1 mt-4 opacity-80">
                    <ShieldCheck size={12} style={{ color: '#22c55e' }} />
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#22c55e' }}>
                      Active Status
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl border bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/intern/${intern.id}`}
                    size={75}
                    fgColor="#0f172a"
                    bgColor="transparent"
                    level="H"
                  />
                </div>
              </div>

              {/* Print Bleed Footer */}
              <div className="h-5 w-full flex items-center justify-center absolute bottom-0 left-0" style={{ backgroundColor: '#0f172a' }}>
                <p className="text-[8px] tracking-[0.25em] uppercase font-bold text-white/50">
                  Intern Identification Card
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}