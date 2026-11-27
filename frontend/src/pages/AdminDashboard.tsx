import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import type { Department, ComplaintCategory, EmergencyContact } from '../types';
import { 
  Building2, 
  Grid, 
  PhoneCall, 
  Trash2, 
  Edit3, 
  Plus, 
  Check,
  AlertTriangle,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, token } = useApp();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!token || !user?.isAdmin) {
      navigate('/admin/login');
    }
  }, [user, token, navigate]);

  // Main UI States
  const [activeTab, setActiveTab] = useState<'analytics' | 'departments' | 'categories' | 'emergency' | 'complaints'>('analytics');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyContact[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [emergModalOpen, setEmergModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTargetComplaint, setReplyTargetComplaint] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('In Progress');

  // Edit target states (if null, modal is in CREATE mode)
  const [editDeptTarget, setEditDeptTarget] = useState<Department | null>(null);
  const [editCatTarget, setEditCatTarget] = useState<ComplaintCategory | null>(null);
  const [editEmergTarget, setEditEmergTarget] = useState<EmergencyContact | null>(null);

  // Form Fields - Departments
  const [deptForm, setDeptForm] = useState({
    department_name: '', office_name: '', officer_name: '', designation: '',
    phone: '', emergency_phone: '', email: '', website: '',
    latitude: '', longitude: '', address: '', city: '', district: '', state: '', status: 'Open'
  });

  // Form Fields - Categories
  const [catForm, setCatForm] = useState({
    category_name: '', department_name: '', icon: 'HelpCircle', description: ''
  });

  // Form Fields - Emergencies
  const [emergForm, setEmergForm] = useState({
    department: '', phone: '', city: 'All', state: 'All'
  });

  const triggerAlert = (text: string, type: 'success' | 'error') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, catRes, emergRes, compRes] = await Promise.all([
        api.get('/departments'),
        api.get('/categories'),
        api.get('/emergency'),
        api.get('/complaints/all').catch(() => ({ data: { success: true, data: [] } }))
      ]);

      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (emergRes.data?.success) setEmergencies(emergRes.data.data);
      if (compRes.data?.success) setComplaints(compRes.data.data);
    } catch (err: any) {
      console.error('[Admin Dashboard] Failed to load data:', err);
      triggerAlert(err.message || 'Failed to fetch database tables.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.isAdmin) {
      fetchData();
    }
  }, [token, user]);

  // CRUD Actions - Departments
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editDeptTarget) {
        // Edit Mode
        const response = await api.put(`/departments/${editDeptTarget.id}`, deptForm);
        if (response.data?.success) {
          triggerAlert('Department updated successfully.', 'success');
          fetchData();
          setDeptModalOpen(false);
          setEditDeptTarget(null);
        }
      } else {
        // Create Mode
        const response = await api.post('/departments', deptForm);
        if (response.data?.success) {
          triggerAlert('Department created successfully.', 'success');
          fetchData();
          setDeptModalOpen(false);
        }
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to save department details.', 'error');
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const response = await api.delete(`/departments/${id}`);
      if (response.data?.success) {
        triggerAlert('Department deleted successfully.', 'success');
        fetchData();
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to delete department.', 'error');
    }
  };

  const openEditDept = (dept: Department) => {
    setEditDeptTarget(dept);
    setDeptForm({
      department_name: dept.department_name,
      office_name: dept.office_name,
      officer_name: dept.officer_name || '',
      designation: dept.designation || '',
      phone: dept.phone,
      emergency_phone: dept.emergency_phone || '',
      email: dept.email || '',
      website: dept.website || '',
      latitude: dept.latitude.toString(),
      longitude: dept.longitude.toString(),
      address: dept.address,
      city: dept.city,
      district: dept.district,
      state: dept.state,
      status: dept.status
    });
    setDeptModalOpen(true);
  };

  const openCreateDept = () => {
    setEditDeptTarget(null);
    setDeptForm({
      department_name: 'Municipality', office_name: '', officer_name: '', designation: '',
      phone: '', emergency_phone: '', email: '', website: '',
      latitude: '12.9716', longitude: '77.5946', address: '', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', status: 'Open'
    });
    setDeptModalOpen(true);
  };

  // CRUD Actions - Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCatTarget) {
        const response = await api.put(`/categories/${editCatTarget.id}`, catForm);
        if (response.data?.success) {
          triggerAlert('Category updated successfully.', 'success');
          fetchData();
          setCatModalOpen(false);
          setEditCatTarget(null);
        }
      } else {
        const response = await api.post('/categories', catForm);
        if (response.data?.success) {
          triggerAlert('Category created successfully.', 'success');
          fetchData();
          setCatModalOpen(false);
        }
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to save complaint category.', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data?.success) {
        triggerAlert('Category deleted successfully.', 'success');
        fetchData();
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to delete category.', 'error');
    }
  };

  // CRUD Actions - Emergencies
  const handleSaveEmerg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editEmergTarget) {
        const response = await api.put(`/emergency/${editEmergTarget.id}`, emergForm);
        if (response.data?.success) {
          triggerAlert('Emergency contact updated.', 'success');
          fetchData();
          setEmergModalOpen(false);
          setEditEmergTarget(null);
        }
      } else {
        const response = await api.post('/emergency', emergForm);
        if (response.data?.success) {
          triggerAlert('Emergency contact created.', 'success');
          fetchData();
          setEmergModalOpen(false);
        }
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to save emergency contact.', 'error');
    }
  };

  const handleDeleteEmerg = async (id: number) => {
    if (!window.confirm('Delete emergency number?')) return;
    try {
      const response = await api.delete(`/emergency/${id}`);
      if (response.data?.success) {
        triggerAlert('Emergency contact deleted.', 'success');
        fetchData();
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to delete contact.', 'error');
    }
  };

  const handleUpdateComplaintStatus = async (id: number, status: string) => {
    // Optimistic UI update so status changes instantly
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );

    try {
      const response = await api.put(`/complaints/${id}/status`, { status });
      if (response.data?.success) {
        triggerAlert(`Complaint #${id} updated to ${status}.`, 'success');
      }
    } catch (err: any) {
      console.warn('[Admin] PUT /status error, trying PATCH fallback...', err);
      try {
        const fallbackRes = await api.patch(`/complaints/${id}/status`, { status });
        if (fallbackRes.data?.success) {
          triggerAlert(`Complaint #${id} updated to ${status}.`, 'success');
        }
      } catch (patchErr: any) {
        console.error('[Admin] Failed to update status on server:', patchErr);
        triggerAlert(patchErr.message || 'Failed to update complaint status on server.', 'error');
        fetchData();
      }
    }
  };

  const openReplyModal = (complaint: any) => {
    setReplyTargetComplaint(complaint);
    setReplyMessage(complaint.adminReply || '');
    setReplyStatus(complaint.status || 'In Progress');
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTargetComplaint || !replyMessage.trim()) return;
    try {
      const response = await api.post(`/complaints/${replyTargetComplaint.id}/reply`, {
        reply: replyMessage.trim(),
        status: replyStatus,
      });
      if (response.data?.success) {
        triggerAlert(`Reply sent to ${replyTargetComplaint.userName || 'citizen'}!`, 'success');
        setReplyModalOpen(false);
        setReplyTargetComplaint(null);
        setReplyMessage('');
        fetchData();
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to send official response.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 mx-auto"></div>
        <div className="mt-8 grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto w-full max-w-6xl">
      
      {/* Alert message notification banner */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl px-5 py-3.5 shadow-xl text-xs font-bold flex items-center gap-2 border ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {alertMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 pb-6 dark:border-slate-800/50 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-amber-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            CRUD directories mapping complaint flows, contact desks, and regional hotlines.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:border-slate-800 dark:bg-[#0f1b35] dark:text-slate-300 dark:hover:bg-slate-800/80"
          >
            Refresh Tables
          </button>
        </div>
      </div>

      {/* Tab selectors */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#112240] my-6 max-w-2xl overflow-x-auto">
        {[
          { id: 'analytics', label: 'Overview', icon: LayoutDashboard },
          { id: 'complaints', label: `Citizen Complaints (${complaints.length})`, icon: ShieldAlert },
          { id: 'departments', label: 'Offices', icon: Building2 },
          { id: 'categories', label: 'Categories', icon: Grid },
          { id: 'emergency', label: 'Hotlines', icon: PhoneCall },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white text-govBlue-700 shadow dark:bg-[#0f1b35] dark:text-sky-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div 
              onClick={() => setActiveTab('complaints')}
              className="p-6 rounded-2xl bg-white border border-slate-200/60 dark:border-slate-800 dark:bg-[#0f1b35] flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-sm"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citizen Grievances</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1">{complaints.length}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {complaints.filter(c => c.status === 'Open').length} Open &bull; {complaints.filter(c => c.status === 'Resolved').length} Resolved
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-7 w-7" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('departments')}
              className="p-6 rounded-2xl bg-white border border-slate-200/60 dark:border-slate-800 dark:bg-[#0f1b35] flex items-center justify-between cursor-pointer hover:border-govBlue-400 transition-all shadow-sm"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Offices</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{departments.length}</p>
                <p className="text-[10px] text-slate-400 mt-1">Responsible Municipal Desks</p>
              </div>
              <div className="p-3.5 rounded-xl bg-govBlue-500/10 text-govBlue-600 dark:text-sky-400">
                <Building2 className="h-7 w-7" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('categories')}
              className="p-6 rounded-2xl bg-white border border-slate-200/60 dark:border-slate-800 dark:bg-[#0f1b35] flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all shadow-sm"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Categories</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{categories.length}</p>
                <p className="text-[10px] text-slate-400 mt-1">Grievance Classifications</p>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Grid className="h-7 w-7" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('emergency')}
              className="p-6 rounded-2xl bg-white border border-slate-200/60 dark:border-slate-800 dark:bg-[#0f1b35] flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all shadow-sm"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Helplines</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{emergencies.length}</p>
                <p className="text-[10px] text-slate-400 mt-1">24/7 Rapid Hotlines</p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <PhoneCall className="h-7 w-7" />
              </div>
            </div>

          </div>

          {/* Simple distribution widgets */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/60 dark:border-slate-800 dark:bg-[#0f1b35]">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-100 dark:border-slate-800">
              Department Listings Count by City
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {['Bengaluru', 'Mumbai', 'Delhi'].map((c) => {
                const count = departments.filter((d) => d.city.toLowerCase() === c.toLowerCase()).length;
                return (
                  <div key={c} className="p-4 rounded-xl bg-slate-50 dark:bg-[#112240] text-center border border-slate-200/30">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c}</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{count} Offices</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CITIZEN COMPLAINTS (ADMIN REVIEW & RESOLUTION) */}
      {activeTab === 'complaints' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#14233c]/30">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Citizen Registered Complaints</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review incoming grievances, track priorities, and change resolution statuses.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
              {complaints.length} Total Complaints
            </span>
          </div>

          <div className="overflow-x-auto">
            {complaints.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-bold">No grievances filed yet.</p>
                <p className="text-xs mt-1">New citizen complaints submitted via web or AI Voice will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#112240] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5">ID / Date</th>
                    <th className="p-3.5">Citizen Info</th>
                    <th className="p-3.5">Category & Office</th>
                    <th className="p-3.5">Issue Description</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Manage Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{c.id}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{c.userName || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-400">{c.userPhone || 'No phone'}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-govBlue-50 text-govBlue-700 dark:bg-sky-500/10 dark:text-sky-400 mb-1">
                          {c.categoryName || 'General'}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{c.officeName || c.departmentName}</p>
                        <p className="text-[10px] text-slate-400">{c.location}</p>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="line-clamp-2 text-slate-700 dark:text-slate-300">{c.description}</p>
                        {c.adminReply && (
                          <div className="mt-2 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-800/40 text-[11px] text-sky-800 dark:text-sky-300">
                            <span className="font-extrabold flex items-center gap-1">
                              💬 Officer Reply:
                            </span>
                            <p className="mt-0.5 line-clamp-2">{c.adminReply}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          c.priority === 'High' || c.priority === 'Critical'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {c.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : c.status === 'In Progress'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {c.status || 'Open'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                          <button
                            onClick={() => openReplyModal(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-extrabold px-2.5 py-1 text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
                            title="Reply to citizen"
                          >
                            <span>💬 Reply</span>
                          </button>
                          <select
                            value={c.status || 'Open'}
                            onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                            className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070f1e] px-2 py-1 outline-none text-slate-700 dark:text-slate-200 cursor-pointer hover:border-govBlue-500"
                          >
                            <option value="Open">Set Open</option>
                            <option value="In Progress">Set In Progress</option>
                            <option value="Resolved">Set Resolved</option>
                            <option value="Closed">Set Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS CRUD TABLE */}
      {activeTab === 'departments' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#14233c]/30">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Responsible Department Offices
            </h3>
            <button
              onClick={openCreateDept}
              className="rounded-lg bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#112240] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Office Details</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-3.5">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">{dept.office_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{dept.officer_name || 'No officer set'}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">{dept.department_name}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      <p className="font-bold">{dept.phone}</p>
                      <p className="text-[10px] truncate max-w-[140px]">{dept.email || 'No email'}</p>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      <p className="font-semibold">{dept.city}, {dept.state}</p>
                      <p className="text-[10px] italic">Coords: {dept.latitude}, {dept.longitude}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        dept.status === 'Open' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => openEditDept(dept)}
                          className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES CRUD TABLE */}
      {activeTab === 'categories' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#14233c]/30">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Complaint Categories ({categories.length})
            </h3>
            <button
              onClick={() => {
                setEditCatTarget(null);
                setCatForm({ category_name: '', department_name: 'Municipality', icon: 'HelpCircle', description: '' });
                setCatModalOpen(true);
              }}
              className="rounded-lg bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#112240] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{cat.category_name}</td>
                    <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">{cat.department_name}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{cat.description || '—'}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditCatTarget(cat);
                            setCatForm({
                              category_name: cat.category_name,
                              department_name: cat.department_name,
                              icon: cat.icon || 'HelpCircle',
                              description: cat.description || ''
                            });
                            setCatModalOpen(true);
                          }}
                          className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EMERGENCY HELPLINES CRUD TABLE */}
      {activeTab === 'emergency' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#14233c]/30">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Emergency Helplines ({emergencies.length})
            </h3>
            <button
              onClick={() => {
                setEditEmergTarget(null);
                setEmergForm({ department: '', phone: '', city: 'All', state: 'All' });
                setEmergModalOpen(true);
              }}
              className="rounded-lg bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Helpline</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#112240] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Department / Service</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Coverage (City / State)</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {emergencies.map((em) => (
                  <tr key={em.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{em.department}</td>
                    <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">{em.phone}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{em.city || 'All'}, {em.state || 'All'}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditEmergTarget(em);
                            setEmergForm({
                              department: em.department,
                              phone: em.phone,
                              city: em.city || 'All',
                              state: em.state || 'All'
                            });
                            setEmergModalOpen(true);
                          }}
                          className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmerg(em.id)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENT CREATE/EDIT MODAL */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0f1b35] relative">
            <button
              onClick={() => setDeptModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editDeptTarget ? 'Edit Department Office' : 'Add New Department Office'}
            </h3>

            <form onSubmit={handleSaveDept} className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Department Branch
                  </label>
                  <select
                    value={deptForm.department_name}
                    onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528]"
                  >
                    <option value="Electricity Department">Electricity Department</option>
                    <option value="Municipality">Municipality</option>
                    <option value="Roads Department">Roads Department</option>
                    <option value="Water Supply Department">Water Supply Department</option>
                    <option value="Police Department">Police Department</option>
                    <option value="Fire Department">Fire Department</option>
                    <option value="Health Department">Health Department</option>
                    <option value="Gas Department">Gas Department</option>
                    <option value="Transport Department">Transport Department</option>
                    <option value="Animal Control">Animal Control</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Office / Branch Name
                  </label>
                  <input
                    type="text"
                    value={deptForm.office_name}
                    onChange={(e) => setDeptForm({ ...deptForm, office_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="e.g. BESCOM Indiranagar"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={deptForm.officer_name}
                    onChange={(e) => setDeptForm({ ...deptForm, officer_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="Mr. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Officer Designation
                  </label>
                  <input
                    type="text"
                    value={deptForm.designation}
                    onChange={(e) => setDeptForm({ ...deptForm, designation: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="Assistant Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={deptForm.phone}
                    onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="+918025251111"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Emergency Hotline
                  </label>
                  <input
                    type="tel"
                    value={deptForm.emergency_phone}
                    onChange={(e) => setDeptForm({ ...deptForm, emergency_phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="1912"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Latitude Coordinates
                  </label>
                  <input
                    type="text"
                    value={deptForm.latitude}
                    onChange={(e) => setDeptForm({ ...deptForm, latitude: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="e.g. 12.9784"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Longitude Coordinates
                  </label>
                  <input
                    type="text"
                    value={deptForm.longitude}
                    onChange={(e) => setDeptForm({ ...deptForm, longitude: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="e.g. 77.6408"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={deptForm.city}
                    onChange={(e) => setDeptForm({ ...deptForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={deptForm.district}
                    onChange={(e) => setDeptForm({ ...deptForm, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={deptForm.state}
                    onChange={(e) => setDeptForm({ ...deptForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Office Address
                </label>
                <textarea
                  value={deptForm.address}
                  onChange={(e) => setDeptForm({ ...deptForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528] h-16 resize-none"
                  placeholder="100 Feet Rd, Indiranagar, Bengaluru"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Office Status
                  </label>
                  <select
                    value={deptForm.status}
                    onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Emergency Only">Emergency Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Officer Email
                  </label>
                  <input
                    type="email"
                    value={deptForm.email}
                    onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                    placeholder="officer@gov.in"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-govBlue-700 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 mt-2"
              >
                {editDeptTarget ? 'Save Changes' : 'Create Office Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATE/EDIT MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0f1b35] relative">
            <button
              onClick={() => setCatModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editCatTarget ? 'Edit Complaint Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={catForm.category_name}
                  onChange={(e) => setCatForm({ ...catForm, category_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  placeholder="e.g. Street Light"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Department Branch
                </label>
                <input
                  type="text"
                  value={catForm.department_name}
                  onChange={(e) => setCatForm({ ...catForm, department_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  placeholder="e.g. Municipality"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  placeholder="Short description of grievance type"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-govBlue-700 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 mt-2"
              >
                {editCatTarget ? 'Save Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY CREATE/EDIT MODAL */}
      {emergModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0f1b35] relative">
            <button
              onClick={() => setEmergModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editEmergTarget ? 'Edit Emergency Helpline' : 'Add New Helpline'}
            </h3>

            <form onSubmit={handleSaveEmerg} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Department / Service Name
                </label>
                <input
                  type="text"
                  value={emergForm.department}
                  onChange={(e) => setEmergForm({ ...emergForm, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  placeholder="e.g. Police Control Room"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number / Short Code
                </label>
                <input
                  type="text"
                  value={emergForm.phone}
                  onChange={(e) => setEmergForm({ ...emergForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  placeholder="e.g. 112"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    City (or All)
                  </label>
                  <input
                    type="text"
                    value={emergForm.city}
                    onChange={(e) => setEmergForm({ ...emergForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    State (or All)
                  </label>
                  <input
                    type="text"
                    value={emergForm.state}
                    onChange={(e) => setEmergForm({ ...emergForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-[#0b1528]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-govBlue-700 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 mt-2"
              >
                {editEmergTarget ? 'Save Helpline' : 'Create Helpline'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT OFFICIAL REPLY MODAL */}
      {replyModalOpen && replyTargetComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0f1b35] relative">
            <button
              onClick={() => setReplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  Official Officer Reply to Citizen
                </h3>
                <p className="text-xs text-slate-500">
                  Ticket #{replyTargetComplaint.id} &bull; {replyTargetComplaint.userName}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#070f1e] p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800 mb-4 text-xs">
              <p className="font-extrabold text-slate-700 dark:text-slate-300">Citizen Complaint:</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1 italic leading-relaxed">
                "{replyTargetComplaint.description}"
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                Location: {replyTargetComplaint.location} &bull; Office: {replyTargetComplaint.officeName}
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Official Action / Resolution Update
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="e.g. Field repair vehicle dispatched under Ticket #102. Replacement completed and power restored."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold outline-none dark:border-slate-800 dark:bg-[#0b1528] text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="In Progress">In Progress (Action Underway)</option>
                  <option value="Resolved">Resolved (Issue Fixed)</option>
                  <option value="Closed">Closed</option>
                  <option value="Open">Keep Open</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-govBlue-700 py-3 text-xs font-extrabold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-md"
                >
                  Send Reply & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
