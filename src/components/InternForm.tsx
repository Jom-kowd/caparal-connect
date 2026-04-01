import { useState } from 'react';
import { Intern } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface InternFormProps {
  initialData?: Intern;
  onSubmit: (data: Omit<Intern, 'id' | 'internId' | 'createdAt'>) => void;
  onCancel: () => void;
}

const departments = [
  'Graphics IT Intern',
  'Web Development Intern',
  'Network IT Intern',
  'Technical Support Intern',
  'Software Development Intern',
];

export default function InternForm({ initialData, onSubmit, onCancel }: InternFormProps) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || '',
    photo: initialData?.photo || '',
    school: initialData?.school || '',
    course: initialData?.course || '',
    contactNumber: initialData?.contactNumber || '',
    department: initialData?.department || departments[0],
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    status: initialData?.status || 'Active' as const,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.school.trim() || !form.course.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
          <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">School *</label>
          <Input value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Course *</label>
          <Input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. BSIT" required />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Contact Number</label>
          <Input value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Department</label>
          <select
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Start Date</label>
          <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">End Date</label>
          <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Profile Photo</label>
          <Input type="file" accept="image/*" onChange={handlePhotoChange} />
          {form.photo && (
            <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-lg object-cover mt-2 border border-border" />
          )}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="gradient-brand text-primary-foreground hover:opacity-90">
          {initialData ? 'Update Intern' : 'Add Intern'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
