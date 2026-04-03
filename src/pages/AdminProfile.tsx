import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { getUser, updateUserProfile, getSystemUsers, addSystemUser, deleteSystemUser, AppUser } from '@/lib/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, UserCircle, Users, Settings, Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminProfile() {
  const queryClient = useQueryClient();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'Admin';

  const [activeTab, setActiveTab] = useState<'profile' | 'accounts'>('profile');
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    username: currentUser?.username || '',
    password: '',
    photo: currentUser?.photo || ''
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['app_users'],
    queryFn: getSystemUsers,
    enabled: isAdmin // Kunin lang ang listahan ng users kung siya ay Admin
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(currentUser!.id, data),
    onSuccess: () => {
      toast.success('Profile updated successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm(f => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = { fullName: profileForm.fullName, username: profileForm.username, photo: profileForm.photo };
    if (profileForm.password) updates.password = profileForm.password;
    updateProfileMutation.mutate(updates);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) return toast.error("You cannot delete your own account.");
    if (confirm("Delete this system user?")) {
      await deleteSystemUser(id);
      queryClient.invalidateQueries({ queryKey: ['app_users'] });
      toast.success("User deleted.");
    }
  };

  const handleAddUser = async () => {
    const username = prompt("Enter new Username / Email:");
    if (!username) return;
    const password = prompt("Enter temporary Password:");
    if (!password) return;
    const fullName = prompt("Enter Full Name:");
    if (!fullName) return;
    const role = confirm("Make this user an Admin? (OK for Admin, Cancel for Staff)") ? 'Admin' : 'Staff';
    
    await addSystemUser({ username, password, fullName, role });
    queryClient.invalidateQueries({ queryKey: ['app_users'] });
    toast.success(`${role} account created successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
           <Settings size={28} className="text-brand-orange" /> System Preferences
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal profile and system accounts.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/50 mb-6">
        <button onClick={() => setActiveTab('profile')} className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'profile' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>My Profile</button>
        {isAdmin && (
          <button onClick={() => setActiveTab('accounts')} className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'accounts' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Manage Accounts (Admin)</button>
        )}
      </div>

      <div className="max-w-4xl">
        {activeTab === 'profile' && (
          <div className="glass-card rounded-2xl p-8 border border-border/50 shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profileForm.photo ? <img src={profileForm.photo} className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-slate-300" />}
                </div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-brand-orange/15 text-brand-orange' : 'bg-blue-500/15 text-blue-600'}`}>
                    {currentUser?.role} Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <Input required value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Username / Email</label>
                  <Input required value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">New Password (leave blank to keep current)</label>
                  <Input type="password" placeholder="••••••••" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} className="rounded-xl" />
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending} className="mt-4 gradient-brand text-white rounded-xl shadow-lg shadow-brand-orange/20 font-bold px-8">
                  {updateProfileMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && isAdmin && (
          <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-display font-bold flex items-center gap-2"><Users size={20} className="text-brand-orange"/> System Users</h2>
              <Button onClick={handleAddUser} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs"><Plus size={14}/> Add New User</Button>
            </div>
            {isLoading ? <Loader2 className="animate-spin mx-auto my-8 text-brand-orange" /> : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      {u.photo ? <img src={u.photo} className="w-10 h-10 rounded-full object-cover" /> : <UserCircle size={40} className="text-slate-300" />}
                      <div>
                        <p className="font-bold text-sm text-foreground">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'Admin' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-blue-500/10 text-blue-500'}`}>{u.role}</span>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}