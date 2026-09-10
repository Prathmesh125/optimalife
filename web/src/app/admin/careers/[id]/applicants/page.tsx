"use client";

import { useEffect, useState, use } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { ArrowLeft, FileText, X, Briefcase, Mail, Phone, Calendar, Download } from "lucide-react";

interface ApplicantDoc {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl: string;
  submittedAt: string;
  dynamicData: Record<string, string>;
}

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  
  const [jobTitle, setJobTitle] = useState<string>("Loading...");
  const [jobFormFields, setJobFormFields] = useState<any[]>([]);
  const [applications, setApplications] = useState<ApplicantDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicantDoc | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch the Job details
        const jobRef = doc(db, "careers", jobId);
        const jobSnap = await getDoc(jobRef);
        
        if (!jobSnap.exists()) {
          setJobTitle("Job Not Found");
          setLoading(false);
          return;
        }

        const jobData = jobSnap.data();
        const title = jobData.title || jobId;
        setJobTitle(title);
        setJobFormFields(jobData.formFields || []);

        // 2. Fetch Applications where jobId == job.title
        const appsRef = collection(db, "applications");
        const q = query(appsRef, where("jobId", "==", title));
        const appSnap = await getDocs(q);
        
        const appsData = appSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ApplicantDoc[];
        
        // Sort by submittedAt descending (since Firestore query with where + orderBy requires an index)
        setApplications(appsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        
      } catch (error) {
        console.error("Error fetching job or applications:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [jobId]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <Link 
          href="/admin/careers" 
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Applicants</h1>
          <p className="text-slate-500 font-medium mt-1">Reviewing candidates for: <span className="font-bold text-[#6C63FF]">{jobTitle}</span></p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Applied On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {app.applicantName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">{app.applicantName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-600 flex items-center space-x-2">
                      <Mail size={14} className="text-slate-400" />
                      <span>{app.applicantEmail}</span>
                    </div>
                    {app.applicantPhone && (
                      <div className="text-sm font-medium text-slate-500 mt-1 flex items-center space-x-2">
                        <Phone size={14} className="text-slate-400" />
                        <span>{app.applicantPhone}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                    {new Date(app.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-[#6C63FF] hover:text-white transition-colors font-bold text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                        <Briefcase size={32} />
                      </div>
                      <p className="text-slate-500 font-medium text-lg">No applications yet.</p>
                      <p className="text-slate-400 text-sm">When candidates apply for {jobTitle}, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-[#3a356a]">{selectedApp.applicantName}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1 flex items-center">
                  <Calendar size={14} className="mr-1.5" /> Applied on {new Date(selectedApp.submittedAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Data */}
                <div className="space-y-8">
                  {/* Contact Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase mb-1">Email</p>
                        <a href={`mailto:${selectedApp.applicantEmail}`} className="text-[#6C63FF] font-medium hover:underline">{selectedApp.applicantEmail}</a>
                      </div>
                      {selectedApp.applicantPhone && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase mb-1">Phone</p>
                          <a href={`tel:${selectedApp.applicantPhone}`} className="text-slate-700 font-medium hover:text-[#6C63FF] transition-colors">{selectedApp.applicantPhone}</a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Form Data (Dynamic) */}
                  {Object.keys(selectedApp.dynamicData || {}).length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Application Details & Skills</h3>
                      <div className="space-y-5">
                        {Object.entries(selectedApp.dynamicData).map(([fieldId, value]) => {
                          // Try to find the original label from the job form fields config
                          const fieldConfig = jobFormFields.find(f => f.id === fieldId);
                          const label = fieldConfig ? fieldConfig.label : fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                          
                          // Handle boolean/checkbox
                          if (value === "true" || value === true as any) value = "Yes";
                          if (value === "false" || value === false as any) value = "No";
                          
                          return (
                            <div key={fieldId}>
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">{label}</p>
                              <div className="text-slate-800 font-medium whitespace-pre-wrap bg-slate-50 px-4 py-3 rounded-xl text-sm border border-slate-100">
                                {value || <span className="text-slate-300 italic">Not provided</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Resume Viewer */}
                <div className="h-[600px] flex flex-col bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden relative group">
                  <div className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-md absolute top-0 w-full z-10 border-b border-white/10">
                    <div className="flex items-center space-x-2 text-white font-medium">
                      <FileText size={18} className="text-indigo-400" />
                      <span>Resume Viewer</span>
                    </div>
                    {selectedApp.resumeUrl && (
                      <a 
                        href={selectedApp.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                  
                  {selectedApp.resumeUrl ? (
                    <iframe 
                      src={selectedApp.resumeUrl.endsWith('.pdf') ? `${selectedApp.resumeUrl}#toolbar=0&navpanes=0` : selectedApp.resumeUrl} 
                      className="w-full h-full border-none pt-14 bg-white"
                      title="Resume Viewer"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 pt-14">
                      <FileText size={48} className="mb-4 text-slate-700" />
                      <p>No resume uploaded</p>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
