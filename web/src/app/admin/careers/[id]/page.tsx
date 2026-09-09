"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JobEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";
  
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
          setActive(data.active !== false);
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
    try {
      const docId = isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id;
      const docRef = doc(db, "careers", docId);
      
      const payload = {
        title,
        description,
        active,
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        await setDoc(docRef, payload);
        router.push(`/admin/careers/${docId}`);
      } else {
        await updateDoc(docRef, payload);
        setMessage("Job saved successfully!");
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/careers" className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {isNew ? "Create New Job" : `Edit Job: ${title}`}
          </h1>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
                placeholder="e.g. Senior Formulation Scientist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={active ? "active" : "closed"}
                onChange={(e) => setActive(e.target.value === "active")}
                className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="active">Active (Accepting Applications)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Description (Markdown)</label>
          <p className="text-xs text-slate-500 mb-3">Supports standard markdown formatting for requirements and responsibilities.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-800"
            placeholder="Write job description here..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : (isNew ? "Create Job" : "Save Changes")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
