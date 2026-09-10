"use client";

import { useEffect, useState, use } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { ArrowLeft, FileText, X, Briefcase, Mail, Phone, Calendar, Download, Sparkles, TrendingUp } from "lucide-react";

interface ApplicantDoc {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl: string;
  resumeText: string;
  submittedAt: string;
  dynamicData: Record<string, string>;
}

interface MatchScore {
  score: number;
  reason: string;
  loading: boolean;
}

function getMatchBadge(score: number) {
  if (score >= 80) return { label: "Excellent Match", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (score >= 50) return { label: "Good Match", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "bg-amber-500" };
  return { label: "Low Match", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", bar: "bg-red-400" };
}

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

  const [jobData, setJobData] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>("Loading...");
  const [applications, setApplications] = useState<ApplicantDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicantDoc | null>(null);
  const [matchScores, setMatchScores] = useState<Record<string, MatchScore>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const jobRef = doc(db, "careers", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setJobTitle("Job Not Found");
          setLoading(false);
          return;
        }

        const jd = jobSnap.data();
        setJobData(jd);
        const title = jd.title || jobId;
        setJobTitle(title);

        const appsRef = collection(db, "applications");
        const q = query(appsRef, where("jobId", "==", title));
        const appSnap = await getDocs(q);

        const appsData = appSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as ApplicantDoc[];

        // Sort by submittedAt initially
        const sorted = appsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setApplications(sorted);
        setLoading(false);

        // Set all scores to loading state
        const initialScores: Record<string, MatchScore> = {};
        sorted.forEach(app => {
          initialScores[app.id] = { score: 0, reason: "Analyzing...", loading: true };
        });
        setMatchScores(initialScores);

        // Score all applicants in parallel using AI
        await scoreAllApplicants(sorted, jd);

      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  const scoreAllApplicants = async (apps: ApplicantDoc[], jd: any) => {
    const scoreRequests = apps.map(async (app) => {
      try {
        const resumeContent = app.resumeText || Object.values(app.dynamicData || {}).join(" ");
        const res = await fetch("/api/ai/match-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobTitle: jd.title,
            jobDescription: jd.description,
            requiredSkills: jd.requiredSkills || [],
            resumeText: resumeContent,
          }),
        });
        const data = await res.json();
        return { id: app.id, score: data.score ?? 0, reason: data.reason ?? "Score unavailable" };
      } catch {
        return { id: app.id, score: 0, reason: "Scoring failed" };
      }
    });

    const results = await Promise.all(scoreRequests);

    // Update scores state
    const newScores: Record<string, MatchScore> = {};
    results.forEach(r => {
      newScores[r.id] = { score: r.score, reason: r.reason, loading: false };
    });
    setMatchScores(newScores);

    // Re-sort applications by score descending
    setApplications(prev => {
      const sorted = [...prev].sort((a, b) => (newScores[b.id]?.score ?? 0) - (newScores[a.id]?.score ?? 0));
      return sorted;
    });
  };

  const jobFormFields: any[] = jobData?.formFields || [];

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
        {!loading && (
          <div className="ml-auto flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold">
            <Sparkles size={15} />
            <span>AI-Ranked by Match Score</span>
          </div>
        )}
      </div>

      {/* Required Skills preview */}
      {!loading && jobData?.requiredSkills?.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Skills for this Role</p>
          <div className="flex flex-wrap gap-2">
            {jobData.requiredSkills.map((s: string, i: number) => (
              <span key={i} className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={13} />
                    <span>AI Match</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Applied On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => {
                const match = matchScores[app.id];
                const badge = match && !match.loading ? getMatchBadge(match.score) : null;

                return (
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
                    <td className="px-6 py-5">
                      {!match || match.loading ? (
                        <div className="flex items-center space-x-2 text-slate-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6C63FF]"></div>
                          <span className="text-xs font-medium">Scoring...</span>
                        </div>
                      ) : (
                        <div>
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${badge?.bg} ${badge?.border} ${badge?.text}`} title={match.reason}>
                            <span className="text-base font-black">{match.score}%</span>
                            <span>{badge?.label}</span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-1.5 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${badge?.bar}`} style={{ width: `${match.score}%` }} />
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate" title={match.reason}>{match.reason}</p>
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
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
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
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white z-10">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-black text-[#3a356a]">{selectedApp.applicantName}</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1 flex items-center">
                    <Calendar size={14} className="mr-1.5" /> Applied on {new Date(selectedApp.submittedAt).toLocaleString()}
                  </p>
                </div>
                {/* Match Badge in Modal Header */}
                {matchScores[selectedApp.id] && !matchScores[selectedApp.id].loading && (() => {
                  const m = matchScores[selectedApp.id];
                  const b = getMatchBadge(m.score);
                  return (
                    <div className={`flex flex-col items-center px-5 py-3 rounded-2xl border ${b.bg} ${b.border}`}>
                      <span className={`text-3xl font-black ${b.text}`}>{m.score}%</span>
                      <span className={`text-xs font-bold ${b.text}`}>{b.label}</span>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${m.score}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Reason Banner */}
            {matchScores[selectedApp.id] && !matchScores[selectedApp.id].loading && matchScores[selectedApp.id].reason && (
              <div className="px-8 py-3 bg-indigo-50 border-b border-indigo-100 flex items-start space-x-2">
                <Sparkles size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-700 font-medium italic">"{matchScores[selectedApp.id].reason}"</p>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Data */}
                <div className="space-y-8">
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

                  {Object.keys(selectedApp.dynamicData || {}).length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Application Details & Skills</h3>
                      <div className="space-y-5">
                        {Object.entries(selectedApp.dynamicData).map(([fieldId, value]) => {
                          const fieldConfig = jobFormFields.find((f: any) => f.id === fieldId);
                          const label = fieldConfig ? fieldConfig.label : fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
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
                <div className="h-[600px] flex flex-col bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-800/80 absolute-like border-b border-white/10">
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
