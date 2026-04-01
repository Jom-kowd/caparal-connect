import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import InternForm from '@/components/InternForm';
import { getInterns, addIntern, updateIntern, deleteIntern } from '@/lib/store';
import { Intern } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Download, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InternsPage() {
  const [interns, setInterns] = useState<Intern[]>(getInterns());
  const [showForm, setShowForm] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');

  const refresh = () => setInterns(getInterns());

  const filtered = useMemo(() => {
    return interns.filter(i => {
      const matchesSearch = i.fullName.toLowerCase().includes(search.toLowerCase()) ||
        i.internId.toLowerCase().includes(search.toLowerCase()) ||
        i.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [interns, search, filterStatus]);

  const handleAdd = (data: Omit<Intern, 'id' | 'internId' | 'createdAt'>) => {
    addIntern(data);
    refresh();
    setShowForm(false);
    toast.success('Intern added successfully!');
  };

  const handleUpdate = (data: Omit<Intern, 'id' | 'internId' | 'createdAt'>) => {
    if (!editingIntern) return;
    updateIntern(editingIntern.id, data);
    refresh();
    setEditingIntern(null);
    toast.success('Intern updated!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this intern?')) return;
    deleteIntern(id);
    refresh();
    toast.success('Intern deleted.');
  };

  const exportCSV = () => {
    const headers = 'Intern ID,Name,School,Course,Department,Status,Start Date,End Date\n';
    const rows = interns.map(i =>
      `${i.internId},${i.fullName},${i.school},${i.course},${i.department},${i.status},${i.startDate},${i.endDate}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interns.csv';
    a.click();
    toast.success('Exported to CSV!');
  };

  if (showForm || editingIntern) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6">
            {editingIntern ? 'Edit Intern' : 'Add New Intern'}
          </h1>
          <div className="glass-card rounded-xl p-6">
            <InternForm
              initialData={editingIntern || undefined}
              onSubmit={editingIntern ? handleUpdate : handleAdd}
              onCancel={() => { setShowForm(false); setEditingIntern(null); }}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Interns</h1>
          <p className="text-muted-foreground text-sm mt-1">{interns.length} total interns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => setShowForm(true)} className="gradient-brand text-primary-foreground gap-2 hover:opacity-90">
            <Plus size={16} /> Add Intern
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Photo</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Intern ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">School</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(intern => (
                <tr key={intern.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    {intern.photo ? (
                      <img src={intern.photo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-brand-orange/30" />
                    ) : (
                      <UserCircle size={40} className="text-muted-foreground" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-brand-orange">{intern.internId}</td>
                  <td className="py-3 px-4 font-medium">{intern.fullName}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{intern.department}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{intern.school}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      intern.status === 'Active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {intern.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setEditingIntern(intern)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(intern.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No interns found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
