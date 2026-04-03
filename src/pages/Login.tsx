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
      {/* Left Brand Panel - Enhanced Enterprise Look */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand-dark relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle background glow effect */}
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

        {/* Footer */}
        <div className="absolute bottom-8 text-[11px] text-slate-500 font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} Caparal Appliances. All rights reserved.
        </div>
      </div>

      {/* Right Login Panel - Modern Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header Branding */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
           <Shield size={24} className="text-brand-orange" />
           <span className="font-display font-bold text-lg tracking-tight">Caparal IMS</span>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please enter your administrator credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
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
                    className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-brand-orange focus:border-brand-orange transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-brand-orange focus:border-brand-orange transition-all"
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 gradient-brand text-white font-bold tracking-wide rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all hover:-translate-y-0.5"
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

            {/* Security Notice */}
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