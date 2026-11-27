import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import type { FiledComplaint } from '../components/FileComplaintModal';
import { 
  FileText, 
  Phone, 
  MapPin, 
  Trash2, 
  ShieldCheck,
  ArrowLeft,
  PlusCircle,
  Copy,
  Check
} from 'lucide-react';

const MyComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<FiledComplaint[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { user } = useApp();

  const loadComplaints = async () => {
    try {
      // Fetch from API
      const response = await api.get('/complaints', {
        params: { userId: user?.id || 1 }
      });
      if (response.data?.success) {
        const mapped = response.data.data.map((c: any) => ({
          id: c.id.toString(),
          ticketNumber: `TKT-${new Date(c.createdAt).getFullYear()}-${c.id.toString().padStart(4, '0')}`,
          category: c.categoryName,
          departmentName: c.departmentName,
          officeName: c.officeName,
          citizenName: c.userName,
          citizenPhone: c.userPhone,
          title: c.description.split('\n')[0] || c.categoryName,
          description: c.description,
          landmark: c.location,
          priority: c.priority,
          status: c.status,
          adminReply: c.adminReply,
          repliedAt: c.repliedAt ? new Date(c.repliedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : null,
          createdAt: new Date(c.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          officerPhone: '112', // Can be enriched from department data if needed
        }));
        setComplaints(mapped);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const handleDeleteComplaint = (id: string) => {
    // Optionally delete from API if implemented. For now just update UI state.
    const updated = complaints.filter(c => c.id !== id);
    setComplaints(updated);
  };

  const handleCopyTicket = (ticketNumber: string, id: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 pb-6 dark:border-slate-800/50 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-8 w-8 text-govBlue-600 dark:text-sky-400" />
            <span>My Lodged Complaints</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Track official grievances submitted to local departments. Dial direct helpline for real-time status updates.
          </p>
        </div>

        <div>
          <Link
            to="/complaints"
            className="flex items-center justify-center gap-2 rounded-2xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-5 py-3 text-xs font-extrabold text-white shadow-md active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>File New Complaint</span>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="mt-8">
        {complaints.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200/60 dark:bg-[#0f1b35] dark:border-slate-800/80 max-w-md mx-auto shadow-sm">
            <div className="h-16 w-16 rounded-full bg-govBlue-50 dark:bg-sky-500/10 flex items-center justify-center text-govBlue-600 dark:text-sky-400 mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              No Active Complaints Registered
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You have not submitted any official complaints yet. Select a category to find nearest offices and lodge a complaint instantly.
            </p>
            <div className="mt-6">
              <Link
                to="/complaints"
                className="inline-flex items-center gap-2 rounded-xl bg-govBlue-700 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                Browse Complaint Categories
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0f1b35] transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold bg-govBlue-500/10 text-govBlue-700 dark:bg-sky-500/10 dark:text-sky-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      {item.ticketNumber}
                    </span>
                    <button
                      onClick={() => handleCopyTicket(item.ticketNumber, item.id)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Copy Ticket ID"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      • {item.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.priority === 'Emergency'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : item.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {item.priority} Priority
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      {item.status}
                    </span>

                    <button
                      onClick={() => handleDeleteComplaint(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Complaint Body */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2 space-y-1.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-govBlue-600 dark:text-sky-400" />
                        {item.landmark}
                      </span>
                      <span>Target: {item.officeName}</span>
                    </div>

                    {(item as any).adminReply && (
                      <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Official Department Response:
                          </span>
                          {(item as any).repliedAt && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                              {(item as any).repliedAt}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {(item as any).adminReply}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Direct Contact Box */}
                  <div className="md:col-span-1 bg-slate-50/80 p-3.5 rounded-xl dark:bg-[#0b1528] border border-slate-100 dark:border-slate-800/50 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Office Line</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.departmentName}</p>
                    <a
                      href={`tel:${item.officerPhone}`}
                      className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 py-2 px-3 text-xs font-extrabold text-white shadow-sm transition-all active:scale-95"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call {item.officerPhone}</span>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyComplaintsPage;
