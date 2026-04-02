import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import InternForm from '@/components/InternForm';
import { getInterns, addIntern, updateIntern, deleteIntern } from '@/lib/internService';
import { Intern } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Download, UserCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function InternsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');

  // ⚡ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: getInterns
  });

  const addMutation = useMutation({
    mutationFn: addIntern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      setShowForm(false);
      toast.success('Intern added successfully!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Intern> }) => updateIntern(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      setEditingIntern(null);
      toast.success('Intern updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIntern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast.success('Intern deleted.');
    }
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const filtered = useMemo(() => {
    return interns.filter(i => {
      const matchesSearch = i.fullName.toLowerCase().includes(search.toLowerCase()) || 
                            i.internId.toLowerCase().includes(search.toLowerCase()) || 
                            i.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [interns, search, filterStatus]);

  // ⚡ PAGINATION LOGIC
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = (data: Omit<Intern, 'id' | 'internId' | 'createdAt'>) => addMutation.mutate(data);
  const handleUpdate = (data: Omit<Intern, 'id' | 'internId' | 'createdAt'>) => editingIntern && updateMutation.mutate({ id: editingIntern.id, data });
  const handleDelete = (id: string) => confirm('Are you sure you want to delete this intern?') && deleteMutation.mutate(id);

  const exportCSV = () => {
    const headers = 'Intern ID,Name,School,Course,Department,Status,Start Date,End Date\n';
    const rows = filtered.map(i => `${i.internId},${i.fullName},${i.school},${i.course},${i.department},${i.status},${i.startDate},${i.endDate}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interns-list.csv';
    a.click();
    toast.success('Exported to CSV!');
  };

  if (showForm || editingIntern) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6">{editingIntern ? 'Edit Intern Profile' : 'Register New Intern'}</h1>
          <div className="glass-card rounded-2xl p-8 shadow-sm">
            <InternForm initialData={editingIntern || undefined} onSubmit={editingIntern ? handleUpdate : handleAdd} onCancel={() => { setShowForm(false); setEditingIntern(null); }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Intern Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all {interns.length} interns in the system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors">
            <Download size={16} /> Export Data
          </Button>
          <Button onClick={() => setShowForm(true)} className="gradient-brand text-primary-foreground gap-2 font-bold shadow-lg shadow-brand-orange/20">
            <Plus size={16} /> Register Intern
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or department..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="rounded-xl border-2 border-border bg-background px-4 py-2 text-sm font-medium outline-none focus:border-brand-orange transition-colors w-full sm:w-[160px]">
          <option value="all">All Status</option>
          <option value="Active">Active Interns</option>
          <option value="Inactive">Inactive Interns</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Profile</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Intern ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden md:table-cell">Department</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden xl:table-cell">School</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                 <tr><td colSpan={7} className="text-center py-16 text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-3" size={32} />Loading intern directory...</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map(intern => (
                  <tr key={intern.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6">
                      <div className="p-0.5 bg-white rounded-full shadow-sm w-fit border border-slate-100">
                        {intern.photo ? <img src={intern.photo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <UserCircle size={40} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs font-bold text-brand-orange">{intern.internId}</td>
                    <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200">{intern.fullName}</td>
                    <td className="py-3 px-6 hidden md:table-cell text-slate-600 font-medium">{intern.department}</td>
                    <td className="py-3 px-6 hidden xl:table-cell text-slate-500 text-xs">{intern.school}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${intern.status === 'Active' ? 'bg-success/15 text-success border border-success/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {intern.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEditingIntern(intern)} title="Edit Intern" className="p-2 rounded-lg bg-slate-50 hover:bg-brand-orange/10 text-slate-500 hover:text-brand-orange transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(intern.id)} title="Delete Intern" className="p-2 rounded-lg bg-slate-50 hover:bg-destructive/10 text-slate-500 hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No interns found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ⚡ PAGINATION CONTROLS */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> interns
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg"><ChevronLeft size={16} /></Button>
              <div className="text-xs font-semibold text-slate-600 px-2">Page {currentPage} of {totalPages}</div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 rounded-lg"><ChevronRight size={16} /></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}