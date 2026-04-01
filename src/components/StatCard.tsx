import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'brand' | 'success' | 'info';
}

const variants = {
  default: 'bg-card border-border',
  brand: 'gradient-brand text-primary-foreground',
  success: 'bg-success text-success-foreground',
  info: 'bg-info text-info-foreground',
};

export default function StatCard({ title, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const isDefault = variant === 'default';
  return (
    <div className={`rounded-xl p-6 border shadow-sm ${variants[variant]} animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDefault ? 'text-muted-foreground' : 'opacity-80'}`}>{title}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${isDefault ? 'bg-primary/10 text-primary' : 'bg-primary-foreground/20'}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
