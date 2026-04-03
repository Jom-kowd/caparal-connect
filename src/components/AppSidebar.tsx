import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, QrCode, ScanLine, 
  CalendarDays, IdCard, LogOut, Building2, Briefcase
} from 'lucide-react';
import { logout } from '@/lib/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
    ${isActive(path) 
      ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
    }
  `;

  return (
    <aside className="w-72 bg-sidebar border-r border-border h-screen flex flex-col hidden lg:flex sticky top-0">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-sm">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight tracking-tight text-sidebar-foreground">Caparal IMS</h2>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-bold">Admin Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        
        {/* MAIN SECTION */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-3">Overview</p>
          <div className="space-y-1.5">
            <Link to="/dashboard" className={linkClass('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/scan" className={linkClass('/scan')}><ScanLine size={18} /> Universal QR Scanner</Link>
          </div>
        </div>

        {/* INTERN MANAGEMENT */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-3">Interns</p>
          <div className="space-y-1.5">
            <Link to="/interns" className={linkClass('/interns')}><Users size={18} /> Intern Directory</Link>
            <Link to="/attendance" className={linkClass('/attendance')}><CalendarDays size={18} /> Attendance Logs</Link>
            <Link to="/id-cards" className={linkClass('/id-cards')}><IdCard size={18} /> Generate Intern IDs</Link>
          </div>
        </div>

        {/* EMPLOYEE MANAGEMENT (BAGONG SECTION) */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-3">Employees</p>
          <div className="space-y-1.5">
            <Link to="/employees" className={linkClass('/employees')}><Briefcase size={18} /> Employee Directory</Link>
            {/* Gagawin pa natin ang mga pages na ito mamaya */}
            <Link to="/employee-attendance" className={linkClass('/employee-attendance')}><CalendarDays size={18} /> Employee Logs</Link>
            <Link to="/employee-id-cards" className={linkClass('/employee-id-cards')}><IdCard size={18} /> Generate Employee IDs</Link>
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-border mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive font-medium">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}