import { useParams } from 'react-router-dom';
import { getInternById, getAttendanceForIntern } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { UserCircle, Mail, Phone, GraduationCap, Building, Calendar } from 'lucide-react';

export default function InternProfile() {
  const { id } = useParams<{ id: string }>();
  const intern = id ? getInternById(id) : undefined;
  const attendance = id ? getAttendanceForIntern(id) : [];

  if (!intern) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Intern Not Found</h1>
          <p className="text-muted-foreground mt-2">This intern profile does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-brand-dark py-8 px-4 text-center">
        <p className="text-xs tracking-widest uppercase text-sidebar-foreground/50">Our Great Home Style Depot Corp.</p>
        <h1 className="text-xl font-display font-bold text-primary-foreground mt-1">
          <span className="text-brand-orange">Caparal</span> Appliances & Furniture
        </h1>
      </div>

      <div className="max-w-lg mx-auto -mt-8 px-4 pb-8">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex justify-center pt-6">
            {intern.photo ? (
              <img src={intern.photo} alt={intern.fullName} className="w-28 h-28 rounded-full object-cover border-4 border-brand-orange shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-4 border-brand-orange">
                <UserCircle size={56} className="text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="text-center px-6 pt-4 pb-2">
            <h2 className="text-2xl font-display font-bold text-foreground">{intern.fullName}</h2>
            <p className="text-sm text-brand-orange font-medium mt-1">{intern.department}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              intern.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {intern.status}
            </span>
          </div>

          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap size={16} className="text-muted-foreground" />
              <span className="text-foreground">{intern.course} — {intern.school}</span>
            </div>
            {intern.contactNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                <span className="text-foreground">{intern.contactNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Building size={16} className="text-muted-foreground" />
              <span className="text-foreground">{intern.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-foreground">{intern.startDate} → {intern.endDate}</span>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-center border-t border-border">
            <div className="p-3 bg-primary-foreground rounded-xl">
              <QRCodeSVG value={`${window.location.origin}/intern/${intern.id}`} size={100} fgColor="hsl(0,0%,6%)" bgColor="transparent" />
            </div>
          </div>

          <div className="px-6 pb-4 text-center">
            <p className="font-mono text-xs text-muted-foreground">{intern.internId}</p>
          </div>

          {attendance.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Recent Attendance</h3>
              <div className="space-y-1">
                {attendance.slice(-5).reverse().map(a => (
                  <div key={a.id} className="flex justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">{a.date}</span>
                    <span className="text-foreground">{a.timeIn} — {a.timeOut || 'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
