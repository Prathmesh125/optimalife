"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { submitApplication } from "@/app/actions/applyJob";
import ReactMarkdown from "react-markdown";
import { Briefcase, MapPin, UploadCloud, CheckCircle } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export default function CareersPage() {
  const [header, setHeader] = useState<{title?: string, subtitle?: string}>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const docRef = doc(db, "pages", "careers");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const sections = docSnap.data().sections || {};
          setHeader(sections.header || {});
          setJobs(sections.jobs || []);
        }
      } catch (err) {
        console.error("Error fetching careers data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !formRef.current) return;
    
    setSubmitting(true);
    setErrorMsg("");
    
    const formData = new FormData(formRef.current);
    formData.append("jobId", selectedJob.title);

    const result = await submitApplication(formData);
    
    if (result.success) {
      setSuccess(true);
      formRef.current.reset();
      setTimeout(() => {
        setSelectedJob(null);
        setSuccess(false);
      }, 3000);
    } else {
      setErrorMsg(result.error || "Failed to submit application.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="max-w-3xl mb-16 text-center mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary-light)]/20 text-[var(--color-primary)] text-sm font-semibold tracking-wider mb-4 border border-[var(--color-primary-light)]/30">
              JOIN OUR TEAM
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-primary)] font-bold mb-6">
              {header.title || "Build the Future of Animal Health"}
            </h1>
            <p className="text-lg text-slate-600">
              {header.subtitle || "We are always looking for passionate, driven individuals to join our team in Pune and across India. Explore our open positions below."}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading open positions...</div>
          ) : (
            <div className="grid md:grid-cols-12 gap-12">
              
              {/* Job List */}
              <div className="md:col-span-5 space-y-4">
                {jobs.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-500">No open positions right now. Check back later!</p>
                  </div>
                ) : (
                  jobs.map(job => (
                    <div 
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                        selectedJob?.id === job.id 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md" 
                          : "border-slate-200 bg-white hover:border-[var(--color-primary-light)]/50 hover:shadow-sm"
                      }`}
                    >
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center space-x-1"><Briefcase size={14}/> <span>{job.type || "Full-Time"}</span></span>
                        <span className="flex items-center space-x-1"><MapPin size={14}/> <span>{job.location || "Pune, MH"}</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Job Details / Application Form */}
              <div className="md:col-span-7">
                {selectedJob ? (
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                    <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-6">{selectedJob.title}</h2>
                    
                    <div className="prose prose-slate max-w-none mb-10 prose-headings:font-serif prose-a:text-blue-600">
                      <ReactMarkdown>{selectedJob.description}</ReactMarkdown>
                    </div>

                    <div className="border-t border-slate-200 pt-10">
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Apply for this position</h3>
                      
                      {success ? (
                        <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex items-center space-x-3 border border-green-100">
                          <CheckCircle size={24} />
                          <span className="font-medium text-lg">Application submitted successfully! We'll be in touch.</span>
                        </div>
                      ) : (
                        <form ref={formRef} onSubmit={handleApply} className="space-y-5">
                          {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
                          
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                              <input type="text" name="name" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                              <input type="email" name="email" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume (PDF, DOCX) *</label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                  <p className="text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                                </div>
                                <input type="file" name="resume" accept=".pdf,.doc,.docx" required className="hidden" />
                              </label>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#00381a] transition-all disabled:opacity-50 mt-4"
                          >
                            {submitting ? "Submitting..." : "Submit Application"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 border border-slate-200 border-dashed rounded-3xl h-full min-h-[400px] flex items-center justify-center text-slate-400">
                    Select a position from the left to view details
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
