import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getEmployees } from '@/lib/employeeService';
import { Employee } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { Download, UserCircle, Loader2, ShieldCheck, Printer, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export default function EmployeeIdCards() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [printMode, setPrintMode] = useState<'single' | 'batch' | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const data = await getEmployees();
      const active = data.filter(e => e.status === 'Active');
      return active;
    }
  });

  useEffect(() => {
    if (employees.length > 0 && !selectedId) setSelectedId(employees[0].id);
  }, [employees, selectedId]);

  const emp = employees.find(e => e.id === selectedId);

  const downloadCard = async () => {
    if (!captureRef.current) return;
    setIsDownloading(true);
    toast.loading('Generating high-quality ID...');
    try {
      const canvas = await html2canvas(captureRef.current, { scale: 4, backgroundColor: '#ffffff', useCORS: true });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${emp?.employeeId || 'employee-id'}-full.png`;
      a.click();
      toast.dismiss();
      toast.success('Downloaded Front and Back successfully!');
    } catch {
      toast.dismiss();
      toast.error('Failed to download card.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (printMode !== null) {
      const timer = setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printMode]);

  if (isLoading) return <DashboardLayout><div className="flex justify-center h-[60vh] items-center"><Loader2 className="animate-spin text-brand-orange" size={48} /></div></DashboardLayout>;

  const FrontIDCard = ({ data }: { data: Employee }) => (
    <div className="w-[340px] h-[540px] bg-white rounded-[16px] overflow-hidden shadow-xl relative flex flex-col border border-slate-200 print:shadow-none print:break-inside-avoid print:border-slate-300" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
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
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#ea580c' }}>{data.position}</p>
        </div>
        <div className="mt-4 w-full">
          <p className="text-[11px] font-bold uppercase tracking-wider leading-snug" style={{ color: '#64748b' }}>Department</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#94a3b8' }}>{data.department}</p>
        </div>
      </div>
      <div className="px-7 pb-8 w-full flex items-end justify-between mt-auto">
        <div className="flex flex-col items-start pb-1">
          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>Employee ID No.</p>
          <p className="font-mono text-base font-bold px-2 py-0.5 rounded border" style={{ color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>{data.employeeId}</p>
        </div>
        <div className="p-2 rounded-xl border bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
          <QRCodeSVG value={`${window.location.origin}/employee/${data.id}`} size={60} fgColor="#0f172a" bgColor="transparent" level="H" />
        </div>
      </div>
      <div className="h-5 w-full flex items-center justify-center absolute bottom-0 left-0" style={{ backgroundColor: '#0f172a' }}>
        <p className="text-[8px] tracking-[0.25em] uppercase font-bold text-white/50">Employee Identification Card</p>
      </div>
    </div>
  );

  const BackIDCard = ({ data }: { data: Employee }) => (
    <div className="w-[340px] h-[540px] bg-white rounded-[16px] overflow-hidden shadow-xl relative flex flex-col border border-slate-200 print:shadow-none print:break-inside-avoid print:border-slate-300" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
      <div className="w-full py-4 flex flex-col items-center justify-center relative z-0" style={{ backgroundColor: '#0f172a' }}>
         <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: '#F97316' }}></div>
         <ShieldCheck size={20} className="text-brand-orange mb-1" />
         <p className="text-[10px] tracking-[0.2em] text-white font-bold uppercase">Scan for Verification</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-4">
        <div className="p-4 rounded-2xl border bg-white shadow-sm mb-4" style={{ borderColor: '#e2e8f0' }}>
          <QRCodeSVG value={`${window.location.origin}/employee/${data.id}`} size={160} fgColor="#0f172a" bgColor="transparent" level="H" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center font-mono">{data.employeeId}</p>
      </div>
      <div className="px-8 pb-10 text-center">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">Terms and Conditions</p>
        <p className="text-[9px] text-slate-500 leading-relaxed font-medium mb-4">This identification card is the property of <span className="font-bold text-slate-700">Caparal Appliances & Furniture</span>. It is non-transferable and must be worn at all times while inside the premises.</p>
        <div className="w-12 h-[1px] bg-slate-300 mx-auto mb-4"></div>
        <p className="text-[9px] font-bold text-slate-800 uppercase mb-1">If found, please return to:</p>
        {/* BINAGO DITO */}
        <p className="text-[9px] text-slate-500 font-medium">OFFICE OF ADMIN ON CAPARAL</p>
      </div>
      <div className="h-2 w-full absolute bottom-0 left-0" style={{ backgroundColor: '#F97316' }}></div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><Briefcase size={28} className="text-brand-orange" /> Employee ID Cards</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate Front and Back PVC IDs for Employees</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPrintMode('single')} className="gap-2 bg-slate-900 text-white hover:bg-slate-800"><Printer size={16} /> Print Current</Button>
          <Button onClick={() => setPrintMode('batch')} variant="outline" className="gap-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"><Printer size={16} /> Print All (Batch)</Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 print:hidden">
        <div className="xl:w-80 w-full shrink-0">
          <div className="glass-card p-6 rounded-2xl">
            <label className="text-xs font-bold text-muted-foreground mb-3 block uppercase tracking-wider">Select Employee</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm mb-6 focus:border-brand-orange outline-none transition-colors font-medium">
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </select>
            {emp && (
              <Button onClick={downloadCard} disabled={isDownloading} className="w-full h-12 gradient-brand text-primary-foreground gap-2 hover:opacity-90 shadow-lg rounded-xl font-bold">
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                DOWNLOAD ID
              </Button>
            )}
          </div>
        </div>

        {emp && (
          <div className="flex-1 flex flex-col sm:flex-row justify-center xl:justify-start gap-6 overflow-x-auto pb-4">
            <div ref={captureRef} className="flex flex-col sm:flex-row gap-6 p-4 bg-transparent">
              <div><p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider text-center">Front Design</p><FrontIDCard data={emp} /></div>
              <div><p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider text-center">Back Design</p><BackIDCard data={emp} /></div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden print:flex print:flex-col print:gap-8">
        {printMode === 'single' && emp && <div className="flex flex-row gap-8 scale-[0.7] transform-gpu origin-top-left"><FrontIDCard data={emp} /><BackIDCard data={emp} /></div>}
        {printMode === 'batch' && employees.map(e => <div key={e.id} className="flex flex-row gap-8 scale-[0.7] transform-gpu origin-top-left print:break-inside-avoid"><FrontIDCard data={e} /><BackIDCard data={e} /></div>)}
      </div>
    </DashboardLayout>
  );
}