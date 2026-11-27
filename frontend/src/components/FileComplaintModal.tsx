import React, { useState } from 'react';
import type { Department, ComplaintCategory } from '../types';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Phone, 
  Upload, 
  Copy, 
  Check, 
  FileText,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';

export interface FiledComplaint {
  id: string;
  ticketNumber: string;
  category: string;
  departmentName: string;
  officeName: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  description: string;
  landmark: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Registered' | 'Under Investigation' | 'Officer Dispatched' | 'Resolved';
  createdAt: string;
  officerPhone: string;
}

interface FileComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  category: ComplaintCategory | null;
}

const FileComplaintModal: React.FC<FileComplaintModalProps> = ({
  isOpen,
  onClose,
  department,
  category,
}) => {
  const navigate = useNavigate();
  const { user } = useApp();

  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [attachment, setAttachment] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<FiledComplaint | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  if (!isOpen) return null;

  const deptName = department?.department_name || category?.department_name || 'Government Desk';
  const officeName = department?.office_name || `${deptName} Regional Office`;
  const officerPhone = department?.phone || '112';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !citizenPhone.trim() || !title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const payload = {
        categoryId: category?.id || 0,
        departmentId: department?.id || 0,
        categoryName: category?.category_name || 'General Grievance',
        departmentName: deptName,
        officeName: officeName,
        userId: user?.id || 1, // Fallback to 1 if anonymous
        userName: citizenName.trim(),
        userPhone: citizenPhone.trim(),
        priority: priority,
        location: landmark.trim() || department?.address || 'Current User Coordinates',
        description: title.trim() + '\n' + description.trim()
      };

      const response = await api.post('/complaints', payload);
      
      if (response.data?.success) {
        const newComplaint = response.data.data;
        // Map backend response to frontend FiledComplaint structure
        const formatted: FiledComplaint = {
          id: newComplaint.id.toString(),
          ticketNumber: ticketId,
          category: newComplaint.categoryName,
          departmentName: newComplaint.departmentName,
          officeName: newComplaint.officeName,
          citizenName: newComplaint.userName,
          citizenPhone: newComplaint.userPhone,
          title: title.trim(),
          description: description.trim(),
          landmark: newComplaint.location,
          priority: newComplaint.priority as any,
          status: newComplaint.status as any,
          createdAt: new Date(newComplaint.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          officerPhone: officerPhone,
        };

        setSubmittedTicket(formatted);
      }
    } catch (err) {
      console.error('Failed to submit complaint to backend:', err);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (submittedTicket) {
      navigator.clipboard.writeText(submittedTicket.ticketNumber);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setTitle('');
    setDescription('');
    setLandmark('');
    setAttachment(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0f1b35] dark:border dark:border-slate-800 transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b1528]/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-govBlue-500/10 text-govBlue-600 dark:bg-sky-500/10 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                File Official Complaint
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {deptName} • {category?.category_name || 'General Concern'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submittedTicket ? (
            /* Ticket Confirmation Step */
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Complaint Registered Successfully
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Reference Ticket Created
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Your complaint has been logged with <strong className="text-slate-700 dark:text-slate-200">{submittedTicket.officeName}</strong>.
                </p>
              </div>

              {/* Ticket Card Box */}
              <div className="rounded-2xl border border-dashed border-govBlue-300 bg-govBlue-50/40 p-4 dark:border-sky-500/30 dark:bg-sky-500/5 text-left space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-govBlue-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Ticket Reference No.
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-extrabold text-govBlue-700 dark:text-sky-400 tracking-wide">
                      {submittedTicket.ticketNumber}
                    </span>
                    <button
                      onClick={handleCopyTicket}
                      className="p-1 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Copy Ticket ID"
                    >
                      {copiedTicket ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-800 dark:text-slate-200">Subject:</strong> {submittedTicket.title}</p>
                  <p><strong className="text-slate-800 dark:text-slate-200">Urgency:</strong> <span className="font-semibold text-amber-600 dark:text-amber-400">{submittedTicket.priority} Priority</span></p>
                  <p><strong className="text-slate-800 dark:text-slate-200">Status:</strong> <span className="font-semibold text-emerald-600 dark:text-emerald-400">{submittedTicket.status}</span></p>
                  <p><strong className="text-slate-800 dark:text-slate-200">Direct Helpline:</strong> {submittedTicket.officerPhone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`tel:${submittedTicket.officerPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 py-3 text-xs font-extrabold text-white shadow-md active:scale-95 transition-all"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Officer Now</span>
                </a>

                <button
                  onClick={() => {
                    handleResetAndClose();
                    navigate('/my-complaints');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Track My Complaints
                </button>
              </div>
            </div>
          ) : (
            /* Complaint Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Target Office Banner */}
              <div className="rounded-2xl bg-govBlue-50/60 p-3.5 border border-govBlue-100/50 dark:bg-sky-500/10 dark:border-sky-500/20 text-xs">
                <p className="font-bold text-govBlue-800 dark:text-sky-300">
                  Target Authority: {officeName}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{department?.address || 'Current Location Region'}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Complaint Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Power outage lasting more than 4 hours in Block B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the exact situation, street number, affected houses, spark risk, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Specific Landmark / Location
                  </label>
                  <input
                    type="text"
                    placeholder="Near Apollo Pharmacy, 4th Cross"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs outline-none focus:border-govBlue-500 focus:bg-white dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500 font-semibold"
                  >
                    <option value="Low">Low - Normal Priority</option>
                    <option value="Medium">Medium - Standard (24 hrs)</option>
                    <option value="High">High - Urgent (Sub-4 hrs)</option>
                    <option value="Emergency">Emergency - Immediate Hazard</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload Attachment Simulation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Upload Photo Evidence (Optional)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b1528]/50">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div className="flex-1 text-xs">
                    {attachment ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{attachment}</span>
                    ) : (
                      <span className="text-slate-400">Click to upload photo of issue (.jpg, .png)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(attachment ? null : 'photo_evidence_sample.jpg')}
                    className="text-xs font-bold text-govBlue-700 dark:text-sky-400 hover:underline"
                  >
                    {attachment ? 'Remove' : 'Select'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-govBlue-700/20 active:scale-95 transition-all disabled:bg-slate-400"
                >
                  {isSubmitting ? (
                    <span>Registering Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Official Complaint</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default FileComplaintModal;
