import { useState } from 'react';
import { Employee } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    status: initialData?.status || 'Active',
    photo: initialData?.photo || '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Limitahan ang size sa 2MB para hindi bumagal ang database
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => setFormData(f => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Employee, 'id' | 'employeeId' | 'createdAt'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Full Name</label>
          <Input 
            required 
            placeholder="e.g. Juan Dela Cruz"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="rounded-xl bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Position / Job Title</label>
          <Input 
            required 
            placeholder="e.g. Sales Manager"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="rounded-xl bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Department</label>
          <Input 
            required 
            placeholder="e.g. Sales & Marketing"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="rounded-xl bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-orange"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
        
        {/* BINAGONG PHOTO FIELD */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Profile Photo (Optional)</label>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            className="rounded-xl bg-slate-50 cursor-pointer file:cursor-pointer file:bg-brand-orange file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-brand-orange/90"
          />
          {formData.photo && (
            <div className="mt-3 animate-fade-in">
              <p className="text-xs text-slate-500 mb-1">Preview:</p>
              <img 
                src={formData.photo} 
                alt="Preview" 
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" 
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button type="submit" className="gradient-brand text-white rounded-xl shadow-md font-bold">
          {initialData ? 'Save Changes' : 'Register Employee'}
        </Button>
      </div>
    </form>
  );
}