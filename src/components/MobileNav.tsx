import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ScanLine, CalendarDays, IdCard, LogOut, Menu, Building2, Briefcase, Settings, UserCircle } from 'lucide-react';
import { logout, getUser } from '@/lib/authService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
    ${isActive(path) 
      ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }
  `;

  const NavItem = ({ to, icon: Icon, children }: any) => (
    <Link to={to} onClick={() => setOpen(false)} className={linkClass(to)}>
      <Icon size={18} /> {children}
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden relative">
          <Menu size={24} className="text-foreground" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-slate-50 dark:bg-slate-950 border-r-0">
        
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight tracking-tight text-foreground">Caparal HRIS</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Workforce Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
          
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Overview</p>
            <div className="space-y-1.5">
              <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/scan" icon={ScanLine}>Universal QR Scanner</NavItem>
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Interns</p>
            <div className="space-y-1.5">
              <NavItem to="/interns" icon={Users}>Intern Directory</NavItem>
              <NavItem to="/attendance" icon={CalendarDays}>Attendance Logs</NavItem>
              <NavItem to="/id-cards" icon={IdCard}>Generate Intern IDs</NavItem>
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Employees</p>
            <div className="space-y-1.5">
              <NavItem to="/employees" icon={Briefcase}>Employee Directory</NavItem>
              <NavItem to="/employee-attendance" icon={CalendarDays}>Employee Logs</NavItem>
              {/* Bagong Leave Management Button */}
              <NavItem to="/leaves" icon={CalendarDays}>Leave Management</NavItem>
              <NavItem to="/employee-id-cards" icon={IdCard}>Generate Employee IDs</NavItem>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-border mt-auto bg-slate-100 dark:bg-slate-900 space-y-2">
          {/* PROFILE BUTTON SA MOBILE */}
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {user?.photo ? <img src={user.photo} className="w-8 h-8 rounded-full object-cover border border-slate-200" /> : <UserCircle size={32} className="text-slate-400" />}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.fullName || 'User'}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${user?.role === 'Admin' ? 'text-brand-orange' : 'text-blue-500'}`}>{user?.role}</p>
            </div>
            <Settings size={16} className="text-slate-400" />
          </Link>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl w-full transition-colors text-slate-600 hover:bg-destructive/10 hover:text-destructive dark:text-slate-400 font-medium">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}