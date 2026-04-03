import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Titingnan ng system kung nakapag-login ka na dati
    const checkAuth = () => {
      if (isAuthenticated()) {
        navigate('/dashboard'); // Kung oo, diretso sa Dashboard
      } else {
        navigate('/login'); // Kung hindi, papuntahin sa Login page
      }
    };

    checkAuth();
  }, [navigate]);

  // Ito ang ipapakita habang nag-iisip ang system (1-2 milliseconds lang ito)
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-brand-orange" size={48} />
    </div>
  );
}