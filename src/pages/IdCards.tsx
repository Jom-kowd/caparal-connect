import { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getInterns } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { Download, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export default function IdCards() {
  const interns = getInterns().filter(i => i.status === 'Active');
  const [selectedId, setSelectedId] = useState<string>(interns[0]?.id || '');
  const cardRef = useRef<HTMLDivElement>(null);

  const intern = interns.find(i => i.id === selectedId);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${intern?.internId || 'id-card'}.png`;
      a.click();
      toast.success('ID Card downloaded!');
    } catch {
      toast.error('Failed to download card');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">ID Card Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate and download intern ID cards with QR codes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Selector */}
        <div className="lg:w-72">
          <label className="text-sm font-medium text-foreground mb-2 block">Select Intern</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mb-4"
          >
            {interns.length === 0 && <option value="">No active interns</option>}
            {interns.map(i => (
              <option key={i.id} value={i.id}>{i.fullName} ({i.internId})</option>
            ))}
          </select>
          {intern && (
            <Button onClick={downloadCard} className="w-full gradient-brand text-primary-foreground gap-2 hover:opacity-90">
              <Download size={16} /> Download as PNG
            </Button>
          )}
        </div>

        {/* Card Preview */}
        {intern && (
          <div className="flex-1 flex justify-center">
            <div
              ref={cardRef}
              className="w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              {/* Card Header */}
              <div className="gradient-brand-dark px-6 py-5 text-center">
                <p className="text-xs tracking-widest uppercase text-sidebar-foreground/50">Our Great Home Style Depot Corp.</p>
                <h2 className="text-lg font-display font-bold text-primary-foreground mt-1">
                  <span className="text-brand-orange">Caparal</span> Appliances & Furniture
                </h2>
              </div>
              
              {/* Photo */}
              <div className="bg-card flex justify-center -mb-12 relative z-10 pt-6">
                {intern.photo ? (
                  <img src={intern.photo} alt={intern.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-brand-orange shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-brand-orange">
                    <UserCircle size={48} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-card px-6 pt-14 pb-4 text-center">
                <h3 className="text-xl font-display font-bold text-foreground">{intern.fullName}</h3>
                <p className="text-sm text-brand-orange font-medium mt-1">{intern.department}</p>
                <p className="text-xs text-muted-foreground mt-1">{intern.course} — {intern.school}</p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-muted text-xs font-mono text-foreground">
                  {intern.internId}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-card px-6 pb-6 flex justify-center">
                <div className="p-3 bg-primary-foreground rounded-xl border border-border">
                  <QRCodeSVG
                    value={`${window.location.origin}/intern/${intern.id}`}
                    size={120}
                    fgColor="hsl(0, 0%, 6%)"
                    bgColor="transparent"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="gradient-brand px-6 py-3 text-center">
                <p className="text-xs font-medium text-primary-foreground">INTERN IDENTIFICATION CARD</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
