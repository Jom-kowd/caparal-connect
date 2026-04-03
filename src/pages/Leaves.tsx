import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getLeaves, addLeave, updateLeaveStatus, deleteLeave } from '@/lib/leaveService';
import { getEmployees } from '@/lib/employeeService';
import { getUser } from '@/lib/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarRange, Plus, Check, X, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'Admin';
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ employeeId: '', type: 'Sick', startDate: '', endDate: '', reason: '' });

  const { data: leaves = [], isLoading: loadL } = useQuery({ queryKey: ['leaves'], queryFn: getLeaves });
  const { data: employees = [], isLoading: loadE } = useQuery({ queryKey: ['employees'], queryFn: getEmployees });

  const addMutation = useMutation({
    mutationFn: addLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setShowForm(false);
      toast.success('Leave request filed successfully.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: any }) => updateLeaveStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave status updated.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave record deleted.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) return toast.error('Fill required fields.');
    addMutation.mutate(form as any);
  };

  if (loadL || loadE) return <DashboardLayout><div className="flex h-[60vh] justify-center items-center"><Loader2 className="animate-spin text-brand-orange" size={48} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><CalendarRange size={28} className="text-brand-orange"/> Leave Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employee absences and vacations.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-brand text-white rounded-xl font-bold"><Plus size={16} className="mr-2"/> File Leave</Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 rounded-2xl mb-8 border border-border/50 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Employee</label>
              <select required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-orange">
                <option value="">Select...</option>
                {employees.filter(e => e.status === 'Active').map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-orange">
                <option>Sick</option><option>Vacation</option><option>Emergency</option><option>Unpaid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Start Date</label>
              <Input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="rounded-xl h-10" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">End Date</label>
              <Input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="rounded-xl h-10" />
            </div>
            <Button type="submit" disabled={addMutation.isPending} className="h-10 rounded-xl gradient-brand text-white font-bold w-full">Submit</Button>
          </form>
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-500 mb-1 block">Reason (Optional)</label>
            <Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Brief description..." className="rounded-xl" />
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
              <th className="text-left p-4 font-semibold text-slate-600">Leave Type</th>
              <th className="text-left p-4 font-semibold text-slate-600">Duration</th>
              <th className="text-left p-4 font-semibold text-slate-600">Reason</th>
              <th className="text-left p-4 font-semibold text-slate-600">Status</th>
              <th className="text-right p-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (<tr><td colSpan={6} className="text-center p-8 text-slate-500">No leave requests found.</td></tr>) : 
            leaves.map(leave => {
              const emp = employees.find(e => e.id === leave.employeeId);
              return (
                <tr key={leave.id} className="border-b border-border/50 hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{emp?.fullName || 'Unknown'}</td>
                  <td className="p-4 text-slate-600">{leave.type}</td>
                  <td className="p-4 text-slate-600">{leave.startDate} to {leave.endDate}</td>
                  <td className="p-4 text-slate-500 text-xs max-w-[150px] truncate">{leave.reason || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${leave.status === 'Approved' ? 'bg-success/15 text-success' : leave.status === 'Rejected' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {leave.status === 'Pending' && isAdmin && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateMutation.mutate({ id: leave.id, status: 'Approved' })} className="p-1.5 bg-success/10 text-success hover:bg-success hover:text-white rounded"><Check size={16}/></button>
                        <button onClick={() => updateMutation.mutate({ id: leave.id, status: 'Rejected' })} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded"><X size={16}/></button>
                      </div>
                    )}
                    {isAdmin && leave.status !== 'Pending' && (
                      <button onClick={() => confirm('Delete record?') && deleteMutation.mutate(leave.id)} className="p-1.5 text-slate-400 hover:bg-destructive/10 hover:text-destructive rounded"><Trash2 size={16}/></button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}