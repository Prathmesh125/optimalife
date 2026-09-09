"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { logAdminAction } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Briefcase, Calendar, CheckCircle2, Plus, Trash2, GripVertical, Settings2, FileText, CheckSquare, Type, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function JobEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";
  
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [scheduledDate, setScheduledDate] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-Time");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [generatingForm, setGeneratingForm] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
  const [useTemplate, setUseTemplate] = useState<"standard" | "custom">("custom");
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    if (isNew) return;
    async function fetchJob() {
      try {
        const docRef = doc(db, "careers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          setType(data.type || "Full-Time");
          
          if (data.status) {
            setStatus(data.status);
          } else {
            setStatus(data.active !== false ? "active" : "closed");
          }
          
          if (data.scheduledDate) {
            setScheduledDate(new Date(data.scheduledDate).toISOString().slice(0, 16));
          }
          
          setUseTemplate("custom");
          setFormFields(data.formFields || []);
        } else {
          setMessage("Job not found.");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    if ((status === "scheduled_active" || status === "scheduled_close") && !scheduledDate) {
      setMessage("Error: Please provide a valid scheduled date/time.");
      setSaving(false);
      return;
    }

    try {
      const docId = isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id;
      const docRef = doc(db, "careers", docId);
      
      const payload = {
        title,
        description,
        status,
        scheduledDate: (status === "scheduled_active" || status === "scheduled_close") && scheduledDate 
          ? new Date(scheduledDate).toISOString() 
          : null,
        active: status === "active" || status === "scheduled_close", // Legacy fallback
        location,
        type,
        useTemplate: "custom",
        formFields: formFields,
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        await setDoc(docRef, payload);
        await logAdminAction("CAREER_CREATED", auth.currentUser?.email || "Unknown", `Created new job role: ${title}`);
        router.push(`/admin/careers/${docId}`);
      } else {
        await updateDoc(docRef, payload);
        setMessage("Job saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C63FF]"></div>
    </div>
  );

  const needsSchedule = status === "scheduled_active" || status === "scheduled_close";

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/careers" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">
              {isNew ? "Create New Job" : `Edit Job`}
            </h1>
            {!isNew && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-slate-400 font-medium">Editing:</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-mono font-bold">/{id}</span>
              </div>
            )}
          </div>
        </div>
        
        {message && message.includes("success") && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-100 shadow-sm animate-pulse">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}
        {message && message.includes("Error") && (
          <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold border border-red-100 shadow-sm">
            <span>{message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Job Settings Block */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 text-slate-800 font-bold shadow-sm"
                required
                placeholder="e.g. Senior Formulation Scientist"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 text-slate-800 font-bold shadow-sm cursor-pointer"
              >
                <option value="active">Immediate Active</option>
                <option value="closed">Immediate Close</option>
                <option value="scheduled_active">Scheduled Active (Opens at date)</option>
                <option value="scheduled_close">Scheduled Close (Closes at date)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 text-slate-800 font-medium shadow-sm"
                placeholder="e.g. Pune, MH"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Employment Type</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 text-slate-800 font-medium shadow-sm"
                placeholder="e.g. Full-Time, Contract"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Scheduling Block */}
        {needsSchedule && (
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#6C63FF]/20 relative overflow-hidden bg-gradient-to-r from-white to-[#6C63FF]/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6C63FF]"></div>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="text-[#6C63FF]" size={20} />
              <h3 className="text-xl font-extrabold text-[#3a356a]">Schedule Details</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 font-medium">
              {status === "scheduled_active" 
                ? "This job posting will remain hidden until the date and time specified below, at which point it will automatically become active."
                : "This job posting is currently active, but it will automatically be closed and removed from the website at the date and time specified below."}
            </p>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required={needsSchedule}
              className="w-full md:w-1/2 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 font-medium text-slate-800 shadow-sm"
            />
          </div>
        )}

        {/* Description Section */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="text-[#3a356a]" size={20} />
                <h3 className="text-xl font-extrabold text-[#3a356a]">Job Description</h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">Supports standard markdown formatting for requirements and responsibilities.</p>
            </div>
            
            <button
              type="button"
              disabled={generatingDesc || (!title && !description)}
              onClick={async () => {
                setGeneratingDesc(true);
                try {
                  const payload = description.trim() ? description : title;
                  const res = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "job_description", payload })
                  });
                  const data = await res.json();
                  if (data.success && data.content) {
                    setDescription(data.content);
                  } else {
                    alert("Error: " + data.error);
                  }
                } catch (err: any) {
                  alert("Failed to expand content: " + err.message);
                } finally {
                  setGeneratingDesc(false);
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#6C63FF]/10 to-[#8f88ff]/10 hover:from-[#6C63FF]/20 hover:to-[#8f88ff]/20 text-[#6C63FF] px-4 py-2 rounded-xl transition-all font-bold disabled:opacity-50 border border-[#6C63FF]/20"
              title="Expand with AI"
            >
              {generatingDesc ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span className="hidden sm:inline text-sm">{generatingDesc ? "Writing..." : "AI Auto-Write"}</span>
            </button>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={15}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none font-mono text-sm text-slate-800 shadow-sm leading-relaxed"
            placeholder="Write job description here, or just type a title above and click 'AI Auto-Write'..."
            required
          />
        </div>

        {/* Form Builder Block */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div className="flex items-center space-x-2 mb-2">
            <Settings2 className="text-[#3a356a]" size={20} />
            <h3 className="text-xl font-extrabold text-[#3a356a]">Application Form Builder</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6 font-medium">Design the form applicants will fill out when applying for this job.</p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                const kekaTemplate = [
                  { id: 'first_name', label: 'First Name', type: 'text', required: true },
                  { id: 'middle_name', label: 'Middle Name', type: 'text', required: false },
                  { id: 'last_name', label: 'Last Name', type: 'text', required: true },
                  { id: 'email', label: 'Email', type: 'email', required: true },
                  { id: 'phone', label: 'Mobile Phone', type: 'tel', required: true },
                  { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
                  { id: 'gender', label: 'Gender', type: 'select', options: 'Male, Female, Other', required: true },
                  { id: 'address', label: 'Present Address', type: 'textarea', required: true },
                  { id: 'nationality', label: 'Nationality', type: 'select', options: 'Indian, Other', required: true },
                  { id: 'education', label: 'Education Details', type: 'education', required: true },
                  { id: 'experience', label: 'Experience Details', type: 'experience', required: true },
                  { id: 'current_location', label: 'Current Location', type: 'text', required: true },
                  { id: 'preferred_location', label: 'Preferred Location', type: 'text', required: true },
                  { id: 'reason_leaving', label: 'Reason of Leaving', type: 'text', required: true },
                  { id: 'notice_period', label: 'Notice Period', type: 'text', required: true },
                  { id: 'join_days', label: 'Available To Join (in days)', type: 'number', required: true },
                  { id: 'skills', label: 'Skills', type: 'textarea', required: false },
                  { id: 'hobbies', label: 'Hobbies', type: 'text', required: true },
                  { id: 'current_salary', label: 'Current Salary (INR)', type: 'number', required: true },
                  { id: 'expected_salary', label: 'Expected Salary (INR)', type: 'number', required: true },
                  { id: 'ref_1', label: 'Reference from current employer (Name & Contact)', type: 'textarea', required: true },
                  { id: 'ref_2', label: 'Reference from previous employer (Name & Contact)', type: 'textarea', required: true }
                ];
                if (formFields.length === 0 || confirm("This will replace your current fields. Continue?")) {
                  setFormFields(kekaTemplate);
                }
              }}
              className={`flex-1 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-slate-600 hover:text-[#6C63FF] hover:bg-white hover:shadow-sm border border-transparent`}
            >
              Load Standard Template
            </button>
            <button
              type="button"
              disabled={generatingForm || !title || !description}
              onClick={async () => {
                if (formFields.length > 0 && !confirm("This will replace your current fields with an AI generated form. Continue?")) {
                  return;
                }
                setGeneratingForm(true);
                try {
                  const res = await fetch("/api/ai/generate-form", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, description })
                  });
                  const data = await res.json();
                  if (data.success && data.fields) {
                    setFormFields(data.fields);
                  } else {
                    alert("Error: " + data.error);
                  }
                } catch (e: any) {
                  alert("Failed to generate form: " + e.message);
                } finally {
                  setGeneratingForm(false);
                }
              }}
              className={`flex-1 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-white bg-gradient-to-r from-[#6C63FF] to-[#8f88ff] shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50`}
            >
              {generatingForm ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing Job...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>AI Auto-Generate Form</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (formFields.length === 0 || confirm("This will clear your current fields to let you start manually. Continue?")) {
                  setFormFields([]);
                }
              }}
              className={`flex-1 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-slate-600 hover:text-red-500 hover:bg-white hover:shadow-sm border border-transparent`}
            >
              Manual Form (Start Fresh)
            </button>
          </div>

          <div className="space-y-6">
            {formFields.map((field, index) => (
              <div key={field.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-[#6C63FF]/30 transition-colors">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move text-slate-300 hover:text-slate-500 transition-all">
                  <GripVertical size={20} />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 ml-6">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const newFields = [...formFields];
                        newFields[index].label = e.target.value;
                        setFormFields(newFields);
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none font-medium text-slate-800"
                      placeholder="e.g. Years of Experience"
                      required
                    />
                  </div>
                  <div className="w-full md:w-56">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newFields = [...formFields];
                        newFields[index].type = e.target.value;
                        setFormFields(newFields);
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none font-medium text-slate-800 cursor-pointer"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="date">Date</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox (Yes/No)</option>
                      <option value="file">File Upload (Resume)</option>
                      <option value="education">Education Block (Complex)</option>
                      <option value="experience">Experience Block (Complex)</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const newFields = [...formFields];
                          newFields[index].required = e.target.checked;
                          setFormFields(newFields);
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-[#6C63FF] focus:ring-[#6C63FF]"
                      />
                      <span className="text-sm font-bold text-slate-600">Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormFields(formFields.filter((_, i) => i !== index));
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Field"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                {field.type === "select" && (
                  <div className="mt-4 ml-6 pl-4 border-l-2 border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Dropdown Options (Comma Separated)</label>
                    <input
                      type="text"
                      value={field.options || ""}
                      onChange={(e) => {
                        const newFields = [...formFields];
                        newFields[index].options = e.target.value;
                        setFormFields(newFields);
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none font-medium text-slate-800"
                      placeholder="e.g. Male, Female, Other"
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setFormFields([...formFields, { id: Math.random().toString(36).substring(7), type: 'text', label: '', required: true }])}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center space-x-2 text-slate-500 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 transition-all font-bold"
            >
              <Plus size={20} />
              <span>Add Custom Field</span>
            </button>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 flex justify-end px-8">
          <div className="max-w-4xl w-full mx-auto flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-[#6C63FF] text-white px-10 py-4 rounded-full hover:bg-[#5b54d6] disabled:opacity-50 transition-all duration-300 font-bold tracking-wide shadow-lg hover:-translate-y-1"
            >
              <Save size={20} />
              <span>{saving ? "Saving..." : (isNew ? "Create Job Post" : "Save Job Changes")}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
