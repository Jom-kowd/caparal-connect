import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ScanLine, CalendarDays, IdCard, LogOut, Building2, Briefcase, Settings, UserCircle } from 'lucide-react';
import { logout, getUser } from '@/lib/authService';
import { toast } from 'sonner';

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser(); // Kunin ang naka-login

  const handleLogout = async () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const linkClass = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(path) ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`;

  return (
    <aside className="w-72 bg-sidebar border-r border-border h-screen flex flex-col hidden lg:flex sticky top-0">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-sm"><Building2 size={20} /></div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight tracking-tight text-sidebar-foreground">Caparal HRIS</h2>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-bold">Workforce Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Overview</p>
          <div className="space-y-1">
            <Link to="/dashboard" className={linkClass('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/scan" className={linkClass('/scan')}><ScanLine size={18} /> Universal QR Scanner</Link>
          </div>
        </div>
        
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Interns</p>
          <div className="space-y-1">
            <Link to="/interns" className={linkClass('/interns')}><Users size={18} /> Intern Directory</Link>
            <Link to="/attendance" className={linkClass('/attendance')}><CalendarDays size={18} /> Attendance Logs</Link>
            <Link to="/id-cards" className={linkClass('/id-cards')}><IdCard size={18} /> Generate Intern IDs</Link>
          </div>
        </div>
        
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Employees</p>
          <div className="space-y-1">
            <Link to="/employees" className={linkClass('/employees')}><Briefcase size={18} /> Employee Directory</Link>
            <Link to="/employee-attendance" className={linkClass('/employee-attendance')}><CalendarDays size={18} /> Employee Logs</Link>
            {/* Bagong Leave Management Button */}
            <Link to="/leaves" className={linkClass('/leaves')}><CalendarDays size={18} /> Leave Management</Link>
            <Link to="/employee-id-cards" className={linkClass('/employee-id-cards')}><IdCard size={18} /> Generate Employee IDs</Link>
          </div>
        </div>
      </div>

      {/* USER PROFILE WIDGET SA ILALIM */}
      <div className="p-4 border-t border-border mt-auto space-y-2">
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {user?.photo ? <img src={user.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200" /> : <UserCircle size={40} className="text-slate-400" />}
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm font-bold truncate ${
                user?.role === 'Admin'
                  ? 'text-orange-500'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {user?.fullName || 'User'}
            </p>
            <p className={`text-[10px] font-black uppercase tracking-widest ${user?.role === 'Admin' ? 'text-brand-orange' : 'text-blue-500'}`}>{user?.role}</p>
          </div>
          <Settings size={16} className="text-slate-400" />
        </Link>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl w-full transition-colors text-slate-500 hover:bg-destructive/10 hover:text-destructive font-semibold text-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}