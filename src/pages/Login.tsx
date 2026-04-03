import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/authService';
import { LogIn, Shield, Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      toast.success('Authentication successful. Welcome to the dashboard.');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Please verify and try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left Brand Panel - Hidden on Mobile, Shows on Desktop (lg) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand-dark relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <Shield size={40} className="text-brand-orange" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
            <span className="text-brand-orange">Caparal</span> Connect
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-slate-300 font-medium">
              Human Resource Information System (HRIS)
            </p>
            <div className="h-px w-12 bg-brand-orange/50 mx-auto"></div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Streamlining workforce tracking, QR-based attendance logs, and PVC ID generation for Our Home Style Depot Corp.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 text-[11px] text-slate-500 font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} Caparal Appliances. All rights reserved.
        </div>
      </div>

      {/* Right Login Panel - Responsive for all screens */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative w-full">
        
        <div className="w-full max-w-[420px] flex flex-col items-center lg:block">
          
          {/* ⚡ MOBILE BRANDING: Naka-center na sa taas ng form */}
          <div className="flex flex-col items-center text-center mb-8 lg:hidden animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-orange/20 mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              <span className="text-brand-orange">Caparal</span> HRIS
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-2">Workforce Portal</p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please enter your administrator credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin@caparal.com"
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 md:h-14 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-brand-orange focus:border-brand-orange transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 h-12 md:h-14 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-brand-orange focus:border-brand-orange transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 md:h-14 mt-6 gradient-brand text-white font-bold tracking-wide rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Shield size={14} className="text-success" />
              <span>Secure administrative portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}