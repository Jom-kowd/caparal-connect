import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns } from '@/lib/internService';
import { QRCodeSVG } from 'qrcode.react';
import { Download, UserCircle, Loader2, ShieldCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export default function IdCards() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ⚡ REACT QUERY
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: async () => {
      const data = await getInterns();
      const active = data.filter(i => i.status === 'Active');
      if (active.length > 0 && !selectedId) setSelectedId(active[0].id);
      return active;
    }
  });

  const intern = interns.find(i => i.id === selectedId);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toast.loading('Generating high-quality ID...');
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 4, backgroundColor: '#ffffff', useCORS: true });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${intern?.internId || 'id-card'}.png`;
      a.click();
      toast.dismiss();
      toast.success('Downloaded successfully!');
    } catch {
      toast.dismiss();
      toast.error('Failed to download card.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ⚡ BATCH PRINT FUNCTION
  const handleBatchPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center h-[60vh] items-center"><Loader2 className="animate-spin text-brand-orange" size={48} /></div>
      </DashboardLayout>
    );
  }

  // REUSABLE ID CARD COMPONENT
  const IDCardDesign = ({ data }: { data: any }) => (
    <div className="w-[340px] h-[540px] bg-white rounded-[16px] overflow-hidden shadow-2xl relative flex flex-col border border-slate-200 print:shadow-none print:break-inside-avoid print:mb-4" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
      <div className="w-full h-[145px] flex flex-col items-center justify-start pt-7 relative z-0" style={{ backgroundColor: '#0f172a' }}>
        <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: '#F97316' }}></div>
        <h2 className="text-[22px] font-black text-white tracking-tight flex items-center gap-2"><span style={{ color: '#F97316' }}>Caparal</span> Appliances</h2>
        <p className="text-[9px] tracking-[0.2em] text-slate-300 font-semibold uppercase mt-1">Home Style Depot Corp.</p>
      </div>
      <div className="relative z-10 flex justify-center -mt-[50px] mb-4">
        <div className="p-1.5 bg-white rounded-full shadow-sm">
          {data.photo ? (
            <img src={data.photo} crossOrigin="anonymous" className="w-[100px] h-[100px] rounded-full object-cover border-2 border-slate-100" style={{ backgroundColor: '#f8fafc' }} />
          ) : (
            <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center border-2 border-slate-100" style={{ backgroundColor: '#f8fafc' }}><UserCircle size={56} className="text-slate-300" /></div>
          )}
        </div>
      </div>
      <div className="px-6 flex flex-col items-center text-center flex-1">
        <h3 className="text-2xl font-black uppercase tracking-tight leading-none" style={{ color: '#0f172a' }}>{data.fullName}</h3>
        <div className="mt-2.5 px-4 py-1 rounded-full border" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#ea580c' }}>{data.department}</p>
        </div>
        <div className="mt-4 w-full">
          <p className="text-[11px] font-bold uppercase tracking-wider leading-snug" style={{ color: '#64748b' }}>{data.course}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#94a3b8' }}>{data.school}</p>
        </div>
      </div>
      <div className="px-7 pb-8 w-full flex items-end justify-between mt-auto">
        <div className="flex flex-col items-start pb-1">
          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>Intern ID No.</p>
          <p className="font-mono text-base font-bold px-2 py-0.5 rounded border" style={{ color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>{data.internId}</p>
        </div>
        <div className="p-2 rounded-xl border bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
          <QRCodeSVG value={`${window.location.origin}/intern/${data.id}`} size={75} fgColor="#0f172a" bgColor="transparent" level="H" />
        </div>
      </div>
      <div className="h-5 w-full flex items-center justify-center absolute bottom-0 left-0" style={{ backgroundColor: '#0f172a' }}>
        <p className="text-[8px] tracking-[0.25em] uppercase font-bold text-white/50">Intern Identification Card</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">ID Card Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate and batch print PVC ID cards</p>
        </div>
        <Button onClick={handleBatchPrint} variant="outline" className="gap-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white">
          <Printer size={16} /> Print All Active IDs (Batch)
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 print:hidden">
        <div className="lg:w-80">
          <div className="glass-card p-6 rounded-2xl">
            <label className="text-xs font-bold text-muted-foreground mb-3 block uppercase tracking-wider">Select Intern</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm mb-6 focus:border-brand-orange outline-none transition-colors font-medium">
              {interns.map(i => <option key={i.id} value={i.id}>{i.fullName}</option>)}
            </select>
            {intern && (
              <Button onClick={downloadCard} disabled={isDownloading} className="w-full h-12 gradient-brand text-primary-foreground gap-2 hover:opacity-90 shadow-lg rounded-xl">
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                DOWNLOAD SINGLE ID
              </Button>
            )}
          </div>
        </div>

        {/* Single Preview for UI */}
        {intern && (
          <div className="flex-1 flex justify-center lg:justify-start" ref={cardRef}>
            <IDCardDesign data={intern} />
          </div>
        )}
      </div>

      {/* ⚡ HIDDEN PRINT LAYOUT (Lalabas lang pag nag Ctrl+P) */}
      <div className="hidden print:flex print:flex-wrap print:gap-4 print:justify-center">
        {interns.map(i => (
          <IDCardDesign key={i.id} data={i} />
        ))}
      </div>
    </DashboardLayout>
  );
}