import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import EmployeeForm from '@/components/EmployeeForm';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/employeeService';
import { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Download, UserCircle, Loader2, ChevronLeft, ChevronRight, Briefcase, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getUser } from '@/lib/authService';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive' | 'On Leave'>('all');
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'Admin';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees
  });

  const addMutation = useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false);
      toast.success('Employee registered successfully!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Employee> }) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditingEmployee(null);
      toast.success('Employee updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted.');
    }
  });

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) || 
                            e.employeeId.toLowerCase().includes(search.toLowerCase()) || 
                            e.position.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [employees, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = (data: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>) => addMutation.mutate(data);
  const handleUpdate = (data: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>) => editingEmployee && updateMutation.mutate({ id: editingEmployee.id, data });
  const handleDelete = (id: string) => confirm('Are you sure you want to remove this employee?') && deleteMutation.mutate(id);

  if (showForm || editingEmployee) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6">{editingEmployee ? 'Edit Employee Record' : 'Register New Employee'}</h1>
          <div className="glass-card rounded-2xl p-8 shadow-sm">
            <EmployeeForm initialData={editingEmployee || undefined} onSubmit={editingEmployee ? handleUpdate : handleAdd} onCancel={() => { setShowForm(false); setEditingEmployee(null); }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
             <Briefcase size={28} className="text-brand-orange" /> Employee Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all {employees.length} employees in the system</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gradient-brand text-primary-foreground gap-2 font-bold shadow-lg shadow-brand-orange/20 rounded-xl">
          <Plus size={18} /> Register Employee
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or position..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="rounded-xl border-2 border-border bg-background px-4 py-2 text-sm font-medium outline-none focus:border-brand-orange transition-colors w-full sm:w-[160px]">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Profile</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Emp ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Position</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Department</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                 <tr><td colSpan={7} className="text-center py-16 text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-3" size={32} />Loading employees...</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map(emp => (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6">
                      <div className="p-0.5 bg-white rounded-full shadow-sm w-fit border border-slate-100">
                        {emp.photo ? <img src={emp.photo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <UserCircle size={40} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs font-bold text-brand-orange">{emp.employeeId}</td>
                    <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200">{emp.fullName}</td>
                    <td className="py-3 px-6 text-slate-600 font-medium">{emp.position}</td>
                    <td className="py-3 px-6 text-slate-500">{emp.department}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.status === 'Active' ? 'bg-success/15 text-success border border-success/20' : 
                        emp.status === 'On Leave' ? 'bg-blue-500/15 text-blue-600 border border-blue-500/20' : 
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex gap-1 justify-end">
  <Link to={`/admin/employee/${emp.id}`} title="View Profile" className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 transition-colors">
    <Eye size={16} />
  </Link>
  <button onClick={() => setEditingEmployee(emp)} title="Edit" className="p-2 rounded-lg hover:bg-brand-orange/10 text-slate-500 hover:text-brand-orange transition-colors"><Pencil size={16} /></button>
  <button onClick={() => handleDelete(emp.id)} title="Delete" className="p-2 rounded-lg hover:bg-destructive/10 text-slate-500 hover:text-destructive transition-colors"><Trash2 size={16} /></button>
</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border/50">
            <p className="text-xs text-slate-500 font-medium">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg"><ChevronLeft size={16} /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 rounded-lg"><ChevronRight size={16} /></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}