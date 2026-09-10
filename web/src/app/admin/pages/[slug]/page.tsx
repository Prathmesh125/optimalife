"use client";

import { useEffect, useState, use, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, FileText, CheckCircle2, UploadCloud, Trash2, Loader2, LayoutTemplate, Layers } from "lucide-react";
import Link from "next/link";
import PageBlockEditor, { PageBlock } from "@/components/admin/PageBlockEditor";

interface PageImage {
  filename: string;
  url: string;
}

export default function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sections, setSections] = useState<any>(null);
  const [images, setImages] = useState<PageImage[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        const docRef = doc(db, "pages", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setContent(data.content || "");
          setSections(data.sections || null);
          setImages(data.images || []);
          setPageBlocks(data.pageBlocks || []);
        } else {
          setMessage("Page not found.");
        }
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const docRef = doc(db, "pages", slug);
      const payload: any = {
        title,
        images,
        pageBlocks,
        updatedAt: new Date().toISOString()
      };
      
      if (sections) {
        payload.sections = sections;
      } else {
        payload.content = content;
      }

      await updateDoc(docRef, payload);
      setMessage("Page saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSectionTextChange = (sectionKey: string, newText: string) => {
    setSections((prev: any) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], text: newText }
    }));
  };

  const updateNested = (sectionKey: string, field: string, value: any) => {
    setSections((prev: any) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value }
    }));
  };

  const updateNestedArray = (sectionKey: string, index: number, field: string, value: any) => {
    setSections((prev: any) => {
      const arr = [...(prev[sectionKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [sectionKey]: arr };
    });
  };

  const updateSectionObjArray = (sectionKey: string, arrayKey: string, index: number, field: string, value: any) => {
    setSections((prev: any) => {
      const sec = { ...prev[sectionKey] };
      const arr = [...(sec[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      sec[arrayKey] = arr;
      return { ...prev, [sectionKey]: sec };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `pages/${slug}`);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newImage = { filename: data.filename, url: data.url };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      
      const docRef = doc(db, "pages", slug);
      await updateDoc(docRef, { images: updatedImages });

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async (imageToDelete: PageImage) => {
    if (!confirm(`Are you sure you want to delete ${imageToDelete.filename}?`)) return;

    try {
      const res = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: imageToDelete.url }), 
      });

      if (!res.ok) throw new Error("Failed to delete from storage");

      const updatedImages = images.filter(img => img.url !== imageToDelete.url);
      setImages(updatedImages);
      
      const docRef = doc(db, "pages", slug);
      await updateDoc(docRef, { images: updatedImages });

    } catch (error: any) {
      alert("Error deleting image: " + error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C63FF]"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/pages" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Edit Page</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-slate-400 font-medium">Editing:</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-mono font-bold">/{slug}</span>
              {sections && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm font-bold ml-2 flex items-center gap-1"><LayoutTemplate size={14}/> Section CMS</span>}
            </div>
          </div>
        </div>
        
        {message && message.includes("success") && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-100 shadow-sm animate-pulse">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Global Page Details */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#6C63FF]"></div>
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="text-[#6C63FF]" size={20} />
            <h2 className="text-xl font-extrabold text-slate-800">Page Global Details</h2>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all duration-200 text-slate-800 font-medium text-lg shadow-sm"
              required
            />
          </div>
        </div>

        {/* --- ABOUT US EDITOR --- */}
        {slug === "about-us" && sections && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Hero (Welcome To)</h2>
              <textarea value={sections.hero?.text || ""} onChange={(e) => handleSectionTextChange("hero", e.target.value)} rows={5} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed" />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">2. Our Core Purpose</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Our Vision</label>
                  <textarea value={sections.vision?.text || ""} onChange={(e) => handleSectionTextChange("vision", e.target.value)} rows={6} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Our Mission</label>
                  <textarea value={sections.mission?.text || ""} onChange={(e) => handleSectionTextChange("mission", e.target.value)} rows={6} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed" />
                </div>
              </div>
            </div>

             <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">3. Our Values</h2>
              <textarea value={sections.values?.text || ""} onChange={(e) => handleSectionTextChange("values", e.target.value)} rows={5} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed" />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">4. Promoting Social Good</h2>
              <textarea value={sections.socialGood?.text || ""} onChange={(e) => handleSectionTextChange("socialGood", e.target.value)} rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed mb-4" />
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Image URLs (3)</label>
                {sections.socialGood?.images?.map((imgUrl: string, idx: number) => (
                  <input key={idx} type="text" value={imgUrl} onChange={(e) => {
                    const newArr = [...sections.socialGood.images];
                    newArr[idx] = e.target.value;
                    updateNested("socialGood", "images", newArr);
                  }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400" />
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">5. Foundations For Achievement</h2>
              <textarea value={sections.foundations?.text || ""} onChange={(e) => handleSectionTextChange("foundations", e.target.value)} rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none transition-all duration-200 font-medium text-sm text-slate-700 shadow-sm leading-relaxed mb-4" />
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Image URL</label>
              <input type="text" value={sections.foundations?.imageUrl || ""} onChange={(e) => updateNested("foundations", "imageUrl", e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400" />
            </div>
          </div>
        )}

        {/* --- HOME EDITOR --- */}
        {slug === "home" && sections && (
          <div className="space-y-8">
            {/* Hero Carousel */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Hero Carousel (3 Slides)</h2>
              <div className="space-y-6">
                {sections.heroCarousel?.map((slide: any, idx: number) => (
                  <div key={idx} className="p-6 border border-slate-200 rounded-2xl bg-slate-50">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Slide {idx + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Badge Text</label>
                        <input type="text" value={slide.badge} onChange={(e) => updateNestedArray("heroCarousel", idx, "badge", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                        <input type="text" value={slide.image} onChange={(e) => updateNestedArray("heroCarousel", idx, "image", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Main Title</label>
                      <textarea value={slide.title} onChange={(e) => updateNestedArray("heroCarousel", idx, "title", e.target.value)} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-medium" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">2. Welcome Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                  <input type="text" value={sections.welcome?.subtitle} onChange={(e) => updateNested("welcome", "subtitle", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                  <input type="text" value={sections.welcome?.phone} onChange={(e) => updateNested("welcome", "phone", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input type="text" value={sections.welcome?.title} onChange={(e) => updateNested("welcome", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea value={sections.welcome?.text} onChange={(e) => updateNested("welcome", "text", e.target.value)} rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Globe Image URL</label>
                <input type="text" value={sections.welcome?.globeImage} onChange={(e) => updateNested("welcome", "globeImage", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono text-sm" />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">3. Statistics (4 Items)</h2>
              <div className="grid grid-cols-2 gap-6">
                {sections.stats?.map((stat: any, idx: number) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex gap-4">
                    <div className="w-1/3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Value</label>
                      <input type="text" value={stat.value} onChange={(e) => updateNestedArray("stats", idx, "value", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold text-lg text-indigo-600" />
                    </div>
                    <div className="w-2/3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Label</label>
                      <input type="text" value={stat.label} onChange={(e) => updateNestedArray("stats", idx, "label", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions Grid */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">4. Solutions Grid</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                  <input type="text" value={sections.solutions?.subtitle} onChange={(e) => updateNested("solutions", "subtitle", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                  <input type="text" value={sections.solutions?.title} onChange={(e) => updateNested("solutions", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.solutions?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Item {idx + 1}</h3>
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                      <input type="text" value={item.title} onChange={(e) => updateSectionObjArray("solutions", "items", idx, "title", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-bold" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <textarea value={item.desc} onChange={(e) => updateSectionObjArray("solutions", "items", idx, "desc", e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                      <input type="text" value={item.image} onChange={(e) => updateSectionObjArray("solutions", "items", idx, "image", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
             {/* Global Presence */}
             <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">5. Global Presence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                  <input type="text" value={sections.globalPresence?.subtitle} onChange={(e) => updateNested("globalPresence", "subtitle", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                  <input type="text" value={sections.globalPresence?.title} onChange={(e) => updateNested("globalPresence", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Map Image URL</label>
                <input type="text" value={sections.globalPresence?.image} onChange={(e) => updateNested("globalPresence", "image", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/30 font-mono text-sm" />
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">6. Certifications (4 Items)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sections.certifications?.map((cert: any, idx: number) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                    <input type="text" value={cert.name} onChange={(e) => updateNestedArray("certifications", idx, "name", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 mb-3 font-bold text-sm" />
                    <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                    <input type="text" value={cert.image} onChange={(e) => updateNestedArray("certifications", idx, "image", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 font-mono text-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
             <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">7. Latest News Handpicks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                  <input type="text" value={sections.latestNews?.subtitle} onChange={(e) => updateNested("latestNews", "subtitle", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                  <input type="text" value={sections.latestNews?.title} onChange={(e) => updateNested("latestNews", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.latestNews?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Article Title</label>
                    <textarea value={item.title} onChange={(e) => updateSectionObjArray("latestNews", "items", idx, "title", e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30 text-sm font-bold mb-3" />
                    <label className="block text-xs font-bold text-slate-500 mb-1">Blog Link</label>
                    <input type="text" value={item.link} onChange={(e) => updateSectionObjArray("latestNews", "items", idx, "link", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30 text-sm mb-3" />
                    <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                    <input type="text" value={item.image} onChange={(e) => updateSectionObjArray("latestNews", "items", idx, "image", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30 font-mono text-xs" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- OPTISERVE EDITOR --- */}
        {slug === "optiserve" && sections && (
          <div className="space-y-8">
            
            {/* Intro Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Introduction Section</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Intro Text (Markdown)</label>
                <textarea value={sections.intro?.text} onChange={(e) => updateNested("intro", "text", e.target.value)} rows={6} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200 font-mono text-sm text-slate-700 shadow-sm leading-relaxed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Intro Image URL</label>
                <input type="text" value={sections.intro?.image} onChange={(e) => updateNested("intro", "image", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm" />
              </div>
            </div>

            {/* Infographic Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">2. Infographic</h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Infographic Image URL</label>
                <input type="text" value={sections.infographic?.image} onChange={(e) => updateNested("infographic", "image", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono text-sm" />
              </div>
            </div>

            {/* Zig-Zag Services Array */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">3. Zig-Zag Services (8 Items)</h2>
              <div className="space-y-6">
                {sections.services?.map((service: any, idx: number) => (
                  <div key={idx} className="p-6 border border-slate-200 rounded-2xl bg-slate-50">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Service {idx + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ID / Number</label>
                        <input type="text" value={service.id} onChange={(e) => updateNestedArray("services", idx, "id", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                        <input type="text" value={service.title} onChange={(e) => updateNestedArray("services", idx, "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-bold" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Content (Markdown supported)</label>
                      <textarea value={service.content} onChange={(e) => updateNestedArray("services", idx, "content", e.target.value)} rows={6} className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm leading-relaxed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                      <input type="text" value={service.image} onChange={(e) => updateNestedArray("services", idx, "image", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- CONTACT US EDITOR --- */}
        {slug === "contact-us" && sections && (
          <div className="space-y-8">
            
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Header</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input type="text" value={sections.header?.title} onChange={(e) => updateNested("header", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                <textarea value={sections.header?.subtitle} onChange={(e) => updateNested("header", "subtitle", e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200 text-sm text-slate-700 shadow-sm leading-relaxed" />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">2. Contact Info</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                <input type="text" value={sections.contactInfo?.phone} onChange={(e) => updateNested("contactInfo", "phone", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/30 font-mono text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <input type="text" value={sections.contactInfo?.email} onChange={(e) => updateNested("contactInfo", "email", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/30 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Physical Address</label>
                <textarea value={sections.contactInfo?.address} onChange={(e) => updateNested("contactInfo", "address", e.target.value)} rows={4} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all duration-200 font-mono text-sm text-slate-700 shadow-sm leading-relaxed" />
              </div>
            </div>

          </div>
        )}

        {/* --- CAREERS EDITOR --- */}
        {slug === "careers" && sections && (
          <div className="space-y-8">
            
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Header</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input type="text" value={sections.header?.title} onChange={(e) => updateNested("header", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle</label>
                <textarea value={sections.header?.subtitle} onChange={(e) => updateNested("header", "subtitle", e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200 text-sm text-slate-700 shadow-sm leading-relaxed" />
              </div>
            </div>

            {/* Jobs Array Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-800">2. Open Positions (Jobs)</h2>
                <button
                  type="button"
                  onClick={() => {
                    const newJobs = [...(sections.jobs || []), { id: `job-${Date.now()}`, title: "New Position", location: "Pune, MH", type: "Full-Time", description: "" }];
                    setSections({ ...sections, jobs: newJobs });
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  + Add Job Position
                </button>
              </div>

              <div className="space-y-6">
                {sections.jobs?.map((job: any, idx: number) => (
                  <div key={idx} className="p-6 border border-slate-200 rounded-2xl bg-slate-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const newJobs = sections.jobs.filter((_: any, i: number) => i !== idx);
                        setSections({ ...sections, jobs: newJobs });
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove Job"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Position {idx + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Job Title</label>
                        <input type="text" value={job.title} onChange={(e) => updateNestedArray("jobs", idx, "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
                        <input type="text" value={job.location} onChange={(e) => updateNestedArray("jobs", idx, "location", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30" placeholder="e.g. Pune, MH" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Job Type</label>
                        <input type="text" value={job.type} onChange={(e) => updateNestedArray("jobs", idx, "type", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30" placeholder="e.g. Full-Time" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Internal ID (Auto-generated)</label>
                        <input type="text" value={job.id} readOnly className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Full Description (Markdown)</label>
                      <textarea value={job.description} onChange={(e) => updateNestedArray("jobs", idx, "description", e.target.value)} rows={8} className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 font-mono text-sm leading-relaxed" placeholder="## Responsibilities..." />
                    </div>
                  </div>
                ))}
                
                {(!sections.jobs || sections.jobs.length === 0) && (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                    No open positions right now. Click "Add Job Position" to create one.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- BLOGS LANDING PAGE EDITOR --- */}
        {slug === "blogs" && sections && (
          <div className="space-y-8">
            
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">1. Header</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input type="text" value={sections.header?.title} onChange={(e) => updateNested("header", "title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 font-bold" />
              </div>
              <p className="text-sm text-slate-500 italic mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong>Note:</strong> To change the large Hero background image for the Blogs page, use the <strong>"Page Media Assets"</strong> section below. Ensure you have exactly one image uploaded there. To manage the actual blog posts themselves, use the dedicated <strong>"Blogs"</strong> menu item in the left sidebar!
              </p>
            </div>

          </div>
        )}

        {/* --- LEGACY MARKDOWN EDITOR (For non-CMS pages) --- */}
        {slug !== "about-us" && slug !== "home" && slug !== "optiserve" && slug !== "contact-us" && slug !== "careers" && slug !== "blogs" && (
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Legacy Markdown Content</label>
              <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline">Formatting Guide</a>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none transition-all duration-200 font-mono text-sm text-slate-700 shadow-sm leading-relaxed"
              placeholder="Write your markdown content here..."
            />
          </div>
        )}

        {/* Media Assets Manager */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ImageIcon className="text-amber-500" size={20} />
              <h3 className="text-xl font-extrabold text-slate-800">Page Media Assets</h3>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-lg font-bold transition-colors border border-amber-100 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          
          {images.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <ImageIcon className="text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-medium">No images uploaded for this page yet.</p>
              <p className="text-slate-400 text-sm mt-1">Upload images to use them on the frontend website.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {images.map((img, i) => (
                <div key={i} className="group relative border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                    
                    {/* Hover Overlay with Delete Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button 
                        type="button"
                        onClick={() => handleImageDelete(img)}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-lg"
                        title="Delete Image Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 truncate" title={img.filename}>
                      {img.filename.split('/').pop()}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <a href={img.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline inline-block">
                        View
                      </a>
                      <button 
                        type="button" 
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          alert("Image URL copied!");
                        }}
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== DYNAMIC PAGE BLOCKS EDITOR ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#6C63FF]"></div>
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="text-[#6C63FF]" size={20} />
            <h2 className="text-xl font-extrabold text-slate-800">Custom Page Content</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Add, reorder, or delete content blocks that appear on the live page below the existing sections. Supports headings, text, images, two-column layouts, and dividers.
          </p>
          <PageBlockEditor
            blocks={pageBlocks}
            onChange={setPageBlocks}
            images={images}
            slug={slug}
            onUpload={async (file) => {
              const fd = new FormData();
              fd.append("file", file);
              fd.append("folder", `pages/${slug}`);
              const res = await fetch("/api/upload", { method: "POST", body: fd });
              const data = await res.json();
              if (!res.ok) { alert("Upload failed: " + data.error); return null; }
              const newImg = { filename: data.filename, url: data.url };
              setImages(prev => [...prev, newImg]);
              return data.url;
            }}
          />
        </div>

        <div className="flex justify-end sticky bottom-8 z-10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-[#6C63FF] text-white px-8 py-4 rounded-xl hover:bg-[#5a52d5] disabled:opacity-50 transition-all duration-300 font-bold tracking-wide shadow-[0_4px_20px_rgba(108,99,255,0.4)] hover:shadow-[0_8px_30px_rgba(108,99,255,0.6)] hover:-translate-y-1"
          >
            <Save size={20} />
            <span>{saving ? "Saving Changes..." : "Save Page Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
