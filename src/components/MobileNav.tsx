import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, ScanLine, CalendarCheck, LogOut, Menu, X } from 'lucide-react';
import { logout } from '@/lib/store';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interns', icon: Users, label: 'Interns' },
  { to: '/id-cards', icon: QrCode, label: 'ID Cards' },
  { to: '/scan', icon: ScanLine, label: 'QR Scan' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between p-4 gradient-brand-dark">
        <h1 className="font-display text-lg font-bold text-primary-foreground">
          <span className="text-brand-orange">Caparal</span> IMS
        </h1>
        <button onClick={() => setOpen(!open)} className="text-primary-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <nav className="gradient-brand-dark p-4 space-y-1 animate-slide-in-right">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-orange text-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/20"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      )}
    </div>
  );
}
