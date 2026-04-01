import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, ScanLine, CalendarCheck, LogOut } from 'lucide-react';
import { logout } from '@/lib/store';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interns', icon: Users, label: 'Interns' },
  { to: '/id-cards', icon: QrCode, label: 'ID Cards' },
  { to: '/scan', icon: ScanLine, label: 'QR Scan' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
];

export default function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen gradient-brand-dark">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-display text-lg font-bold text-primary-foreground">
          <span className="text-brand-orange">Caparal</span> Appliances
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Intern Management System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-orange text-primary-foreground shadow-lg'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
