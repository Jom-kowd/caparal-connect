import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ScanLine, CalendarDays, 
  IdCard, LogOut, Menu, Building2, Briefcase 
} from 'lucide-react';
import { logout } from '@/lib/authService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
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

  // Tulong para hindi paulit-ulit ang pag-type ng Links
  const NavItem = ({ to, icon: Icon, children }: any) => (
    <Link to={to} onClick={() => setOpen(false)} className={linkClass(to)}>
      <Icon size={18} /> {children}
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 🟢 Hamburger Button sa Mobile */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden relative">
          <Menu size={24} className="text-foreground" />
        </Button>
      </SheetTrigger>
      
      {/* 🟢 Slide-out Menu Panel */}
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-slate-50 dark:bg-slate-950 border-r-0">
        
        {/* Branding Logo sa Mobile Menu */}
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
          
          {/* MAIN SECTION */}
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Overview</p>
            <div className="space-y-1.5">
              <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/scan" icon={ScanLine}>Universal QR Scanner</NavItem>
            </div>
          </div>

          {/* INTERN MANAGEMENT */}
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Interns</p>
            <div className="space-y-1.5">
              <NavItem to="/interns" icon={Users}>Intern Directory</NavItem>
              <NavItem to="/attendance" icon={CalendarDays}>Attendance Logs</NavItem>
              <NavItem to="/id-cards" icon={IdCard}>Generate Intern IDs</NavItem>
            </div>
          </div>

          {/* 🔴 EMPLOYEE MANAGEMENT (Dito na-fix ang issue!) */}
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Employees</p>
            <div className="space-y-1.5">
              <NavItem to="/employees" icon={Briefcase}>Employee Directory</NavItem>
              <NavItem to="/employee-attendance" icon={CalendarDays}>Employee Logs</NavItem>
              <NavItem to="/employee-id-cards" icon={IdCard}>Generate Employee IDs</NavItem>
            </div>
          </div>

        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-border mt-auto bg-slate-100 dark:bg-slate-900">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors text-slate-600 hover:bg-destructive/10 hover:text-destructive dark:text-slate-400 font-medium">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}