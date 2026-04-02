import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/authService';
import { LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome back, Admin!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-brand-dark items-center justify-center p-12">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-8 animate-pulse-brand">
            <Shield size={48} className="text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            <span className="text-brand-orange">Caparal</span> Appliances
          </h1>
          <p className="text-lg text-sidebar-foreground/60">Our Great Home Style Depot Corp.</p>
          <p className="text-sm text-sidebar-foreground/40 mt-2">Intern Management & QR Code ID System</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-display font-bold"><span className="text-gradient-brand">Caparal</span> IMS</h1>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Admin Login</h2>
            <p className="text-sm text-muted-foreground mb-6">Sign in to manage interns</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Username / Email</label>
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin@caparal.com" required disabled={isLoading} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLoading} />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full gradient-brand text-primary-foreground hover:opacity-90">
                <LogIn size={18} className="mr-2" />
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}