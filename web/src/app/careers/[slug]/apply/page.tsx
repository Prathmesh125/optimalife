"use client";

import { useEffect, useState, useRef, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { submitApplication } from "@/app/actions/applyJob";
import { UploadCloud, CheckCircle, FileText, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  
  // Dynamic form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const docRef = doc(db, "careers", slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/careers");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [slug, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setResumeFile(file);
    setParsing(true);
    setErrorMsg("");

    try {
      // Determine what schema to tell the AI to look for
      let schema: any = [];
      if (job.useTemplate === "standard" || !job.useTemplate) {
        schema = [
          { id: "name", label: "Full Name", type: "text" },
          { id: "email", label: "Email Address", type: "email" },
          { id: "phone", label: "Phone Number", type: "tel" },
        ];
      } else {
        schema = job.formFields.map((f: any) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          options: f.options
        }));
      }

      const uploadData = new FormData();
      uploadData.append("resume", file);
      uploadData.append("schema", JSON.stringify(schema));

      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: uploadData,
      });

      const result = await res.json();
      if (result.success && result.data) {
        // Merge AI parsed data with existing form data (if any)
        setFormData(prev => ({ ...prev, ...result.data }));
      } else {
        console.error("Parse Error:", result.error);
        alert("AI Parsing Warning: " + (result.error || "Failed to parse resume automatically. Please fill the fields manually."));
      }
    } catch (err: any) {
      console.error("AI Parse failed:", err);
      alert("AI Parsing Warning: Failed to parse resume automatically. Please fill the fields manually.");
    } finally {
      setParsing(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !formRef.current || !resumeFile) {
      setErrorMsg("Please upload your resume.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg("");
    
    // Instead of using formRef directly for all fields (since some might be hidden or custom named),
    // we manually build the FormData from our React state.
    const submitData = new FormData();
    submitData.append("jobId", job.title);
    submitData.append("resume", resumeFile);
    
    // If standard template, map the keys expected by applyJob.ts
    if (job.useTemplate === "standard" || !job.useTemplate) {
      submitData.append("name", formData["name"] || "");
      submitData.append("email", formData["email"] || "");
      submitData.append("phone", formData["phone"] || "");
    } else {
      // For custom form, we need to extract standard fields if they exist, otherwise pass them as dynamic
      // Try to find the email/name fields among custom fields
      const emailField = job.formFields.find((f:any) => f.type === 'email');
      const nameField = job.formFields.find((f:any) => f.label.toLowerCase().includes('name'));
      const phoneField = job.formFields.find((f:any) => f.type === 'tel' || f.label.toLowerCase().includes('phone'));

      submitData.append("name", nameField ? formData[nameField.id] || "Applicant" : "Applicant");
      submitData.append("email", emailField ? formData[emailField.id] || "no-reply@optima.com" : "no-reply@optima.com");
      submitData.append("phone", phoneField ? formData[phoneField.id] || "" : "");
      
      // Append all custom fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
    }

    const result = await submitApplication(submitData);
    
    if (result.success) {
      setSuccess(true);
      setResumeFile(null);
      setFormData({});
      setTimeout(() => {
        router.push("/careers");
      }, 3000);
    } else {
      setErrorMsg(result.error || "Failed to submit application.");
      setSubmitting(false);
    }
  };

  const handleFieldChange = (id: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [id]: value as string }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          
          <Link href={`/careers/${slug}`} className="inline-flex items-center space-x-2 text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors mb-8">
            <ArrowLeft size={18} />
            <span>Back to Job Details</span>
          </Link>
          
          <div className="bg-white p-8 md:p-12 rounded-[30px] shadow-sm border border-slate-200">
            <div className="mb-10 text-center border-b border-slate-100 pb-8">
              <h1 className="text-3xl font-serif text-[var(--color-primary)] font-bold mb-2">
                Apply for {job.title}
              </h1>
              <p className="text-slate-500">Please complete the form below to submit your application.</p>
            </div>
            
            {success ? (
              <div className="bg-green-50 text-green-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-green-100 py-16">
                <CheckCircle size={64} className="mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                <p className="text-lg">Thank you for applying. We will review your application and get back to you shortly.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleApply} className="space-y-8">
                {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">{errorMsg}</div>}
                
                {/* Mega Resume Upload Area */}
                <div className="bg-[#6C63FF]/5 border-2 border-dashed border-[#6C63FF]/30 rounded-3xl p-8 relative hover:bg-[#6C63FF]/10 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center">
                    {parsing ? (
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 text-[#6C63FF] animate-spin" />
                          <Sparkles className="w-6 h-6 text-emerald-400 absolute -top-2 -right-2 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-[#3a356a]">AI is reading your resume...</h4>
                          <p className="text-slate-500 text-sm">We're auto-filling the fields below to save you time.</p>
                        </div>
                      </div>
                    ) : resumeFile ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <FileText className="w-8 h-8 text-[#6C63FF]" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">{resumeFile.name}</h4>
                        <p className="text-emerald-600 text-sm font-semibold flex items-center space-x-1 mt-2">
                          <CheckCircle size={16} /> <span>Resume attached successfully</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-4">Click anywhere in this box to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <UploadCloud className="w-8 h-8 text-[#6C63FF]" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Upload Resume <span className="text-red-500">*</span></h4>
                        <p className="text-slate-500 mb-4 max-w-md">Our AI will automatically scan your resume and fill out the rest of the application form for you!</p>
                        <div className="bg-white px-6 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">Browse Files</div>
                        <p className="text-xs text-slate-400 mt-4">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    required={!resumeFile}
                    onChange={handleResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="w-full h-px bg-slate-100 my-10"></div>

                {/* Dynamic Fields */}
                <div className="space-y-6">
                  {job.useTemplate === "standard" || !job.useTemplate ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                          <input type="text" required value={formData["name"] || ""} onChange={(e) => handleFieldChange("name", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                          <input type="email" required value={formData["email"] || ""} onChange={(e) => handleFieldChange("email", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input type="tel" value={formData["phone"] || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800" />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {job.formFields?.map((field: any) => (
                        <div key={field.id} className={
                          field.type === "textarea" || field.type === "education" || field.type === "experience" 
                            ? "col-span-1 md:col-span-2" 
                            : "col-span-1"
                        }>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          
                          {field.type === "textarea" ? (
                            <textarea 
                              required={field.required}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800"
                            />
                          ) : field.type === "select" ? (
                            <select
                              required={field.required}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800 cursor-pointer"
                            >
                              <option value="">Select an option</option>
                              {field.options?.split(',').map((opt: string) => (
                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                              ))}
                            </select>
                          ) : field.type === "checkbox" ? (
                            <label className="flex items-center space-x-3 cursor-pointer mt-2">
                              <input 
                                type="checkbox"
                                required={field.required}
                                checked={formData[field.id] === "true" || formData[field.id] === true as any}
                                onChange={(e) => handleFieldChange(field.id, e.target.checked ? "true" : "false")}
                                className="w-5 h-5 rounded border-slate-300 text-[#6C63FF] focus:ring-[#6C63FF]"
                              />
                              <span className="text-slate-700 font-medium">{field.label}</span>
                            </label>
                          ) : field.type === "education" || field.type === "experience" ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                              <p className="text-sm text-slate-500 mb-4 font-medium">Please provide your {field.label.toLowerCase()}. You can type it or let our AI parse it from your resume.</p>
                              <textarea 
                                required={field.required}
                                value={formData[field.id] || ""}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                rows={6}
                                placeholder={`Enter your ${field.label.toLowerCase()} details here...`}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800"
                              />
                            </div>
                          ) : (
                            <input 
                              type={field.type} 
                              required={field.required}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 outline-none transition-all font-medium text-slate-800" 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[var(--color-primary)] text-white px-12 py-4 rounded-2xl text-lg font-bold hover:bg-[#00381a] transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
