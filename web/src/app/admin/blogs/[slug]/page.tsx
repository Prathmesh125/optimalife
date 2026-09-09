"use client";

import { useEffect, useState, use, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Calendar, CheckCircle2, FileImage, UploadCloud, Trash2, Loader2, Type, Heading, ChevronUp, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

interface BlogImage {
  filename: string;
  url: string;
}

export interface ContentBlock {
  id: string;
  type: "text" | "image" | "heading";
  content?: string;
  url?: string;
  caption?: string;
}

export default function BlogEditor({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const isNew = slug === "new";
  
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Legacy fallback
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  
  const [scheduledDate, setScheduledDate] = useState("");
  const [images, setImages] = useState<BlogImage[]>([]);
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    async function fetchBlog() {
      try {
        const docRef = doc(db, "blog_posts", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setContent(data.content || "");
          setBlocks(data.blocks || []);
          setImages(data.images || []);
          if (data.scheduledDate) {
            setScheduledDate(new Date(data.scheduledDate).toISOString().slice(0, 16));
          }
        } else {
          setMessage("Blog not found.");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [slug, isNew]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const docId = isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : slug;
      const docRef = doc(db, "blog_posts", docId);
      
      const payload = {
        title,
        content, // Preserve legacy content in DB just in case
        blocks,
        images,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        await setDoc(docRef, payload);
        router.push(`/admin/blogs/${docId}`);
      } else {
        await updateDoc(docRef, payload);
        setMessage("Blog saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (isNew) {
      alert("Please save the blog post once before uploading images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `blogs/${slug}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newImage = { filename: data.filename, url: data.url };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      
      const docRef = doc(db, "blog_posts", slug);
      await updateDoc(docRef, { images: updatedImages });

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async (imageToDelete: BlogImage) => {
    if (!confirm(`Are you sure you want to delete this image?`)) return;

    try {
      const res = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: imageToDelete.url }),
      });

      if (!res.ok) throw new Error("Failed to delete from storage");

      const updatedImages = images.filter(img => img.url !== imageToDelete.url);
      setImages(updatedImages);
      
      const docRef = doc(db, "blog_posts", slug);
      await updateDoc(docRef, { images: updatedImages });

    } catch (error: any) {
      alert("Error deleting image: " + error.message);
    }
  };

  // Block Management
  const addBlock = (type: "text" | "image" | "heading") => {
    const newBlock: ContentBlock = { id: `block-${Date.now()}`, type, content: "", url: "", caption: "" };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (idx: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[idx] = { ...newBlocks[idx], ...updates };
    setBlocks(newBlocks);
  };

  const removeBlock = (idx: number) => {
    const newBlocks = blocks.filter((_, i) => i !== idx);
    setBlocks(newBlocks);
  };

  const moveBlock = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx > 0) {
      const newBlocks = [...blocks];
      [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
      setBlocks(newBlocks);
    } else if (direction === "down" && idx < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[idx + 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx + 1]];
      setBlocks(newBlocks);
    }
  };

  // Helper to quickly convert legacy Markdown to a single Text Block
  const convertLegacyToBlock = () => {
    if (!content) return;
    const newBlock: ContentBlock = { id: `block-${Date.now()}`, type: "text", content: content };
    setBlocks([newBlock, ...blocks]);
    setContent(""); // Clear legacy after converting
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blogs" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">
              {isNew ? "Create New Post" : "Edit Blog Post"}
            </h1>
            {!isNew && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-slate-400 font-medium">Editing:</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-mono font-bold">/{slug}</span>
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
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Title */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-center space-x-2 mb-6">
            <FileImage className="text-emerald-500" size={20} />
            <h2 className="text-xl font-extrabold text-slate-800">Post Title</h2>
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-200 text-slate-800 font-bold text-2xl shadow-sm"
              required
              placeholder="e.g. Why Probiotics Work..."
            />
          </div>
        </div>

        {/* Content Blocks Editor */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Type className="text-purple-500" size={20} />
              <h2 className="text-xl font-extrabold text-slate-800">Content Blocks</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={() => addBlock("heading")} className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                <Heading size={16} /> <span>Add Heading</span>
              </button>
              <button type="button" onClick={() => addBlock("text")} className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                <Type size={16} /> <span>Add Text</span>
              </button>
              <button type="button" onClick={() => addBlock("image")} className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                <ImageIcon size={16} /> <span>Add Image</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {blocks.map((block, idx) => (
              <div key={block.id} className="p-6 border border-slate-200 rounded-2xl bg-slate-50 relative group/block shadow-sm">
                
                {/* Block Controls */}
                <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-50 group-hover/block:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveBlock(idx, "up")} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30">
                    <ChevronUp size={18} />
                  </button>
                  <button type="button" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30">
                    <ChevronDown size={18} />
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-1"></div>
                  <button type="button" onClick={() => removeBlock(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="font-bold text-slate-500 mb-4 uppercase text-[10px] tracking-widest flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">{idx + 1}</span>
                  <span>{block.type} Block</span>
                </h3>

                {block.type === "heading" && (
                  <input
                    type="text"
                    value={block.content || ""}
                    onChange={(e) => updateBlock(idx, { content: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-xl font-bold text-[#3a356a] shadow-sm"
                    placeholder="Enter heading..."
                  />
                )}

                {block.type === "text" && (
                  <textarea
                    value={block.content || ""}
                    onChange={(e) => updateBlock(idx, { content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none font-mono text-sm text-slate-700 shadow-sm leading-relaxed"
                    placeholder="Write text here (Markdown supported)..."
                  />
                )}

                {block.type === "image" && (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="flex-grow">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={block.url || ""}
                          onChange={(e) => updateBlock(idx, { url: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-xs"
                          placeholder="Paste image URL here..."
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Caption (Optional)</label>
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 text-sm"
                          placeholder="Image caption..."
                        />
                      </div>
                    </div>
                    {block.url && (
                      <div className="w-full md:w-1/2 h-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={block.url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {blocks.length === 0 && !content && (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <Plus size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-lg">No content blocks yet.</p>
                <p className="text-sm">Click the buttons above to start building your post.</p>
              </div>
            )}
          </div>

          {/* Legacy Markdown Converter Alert */}
          {content && blocks.length === 0 && (
            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Legacy Markdown Detected</h4>
                <p className="text-sm text-amber-700">This post still uses the old single-textarea Markdown format. You can seamlessly convert it into a Text Block to manage it here.</p>
              </div>
              <button 
                type="button" 
                onClick={convertLegacyToBlock}
                className="whitespace-nowrap bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm"
              >
                Convert to Block
              </button>
            </div>
          )}
        </div>

        {/* Media Assets Manager */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ImageIcon className="text-blue-500" size={20} />
              <h3 className="text-xl font-extrabold text-slate-800">Post Images</h3>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isNew}
              className="flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 rounded-lg font-bold transition-colors border border-blue-100 disabled:opacity-50"
              title={isNew ? "Save the post first to upload images" : ""}
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
          
          <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong>Pro Tip:</strong> Upload an image here. Once uploaded, click <strong>"Copy URL"</strong> and paste it into an Image Block above! The <em>first</em> image you upload here that is not a logo will be automatically used as the Blog's Hero Background.
          </p>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <ImageIcon className="text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-medium">No images uploaded for this post yet.</p>
              {isNew ? (
                <p className="text-slate-400 text-sm mt-1">Please create and save the post before uploading images.</p>
              ) : (
                <p className="text-slate-400 text-sm mt-1">Upload images to use them in your Content Blocks.</p>
              )}
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
                    <div className="flex justify-between items-center mt-2">
                      <a href={img.url} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 hover:text-blue-500 transition-colors">
                        View
                      </a>
                      <button 
                        type="button" 
                        className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-bold"
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          alert("Image URL copied! You can paste it into an Image Block.");
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

        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="text-amber-500" size={20} />
            <h3 className="text-xl font-extrabold text-slate-800">Publishing Options</h3>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Schedule Publication</label>
            <p className="text-sm text-slate-500 mb-4 font-medium">Leave empty to publish immediately, or set a future date to schedule this post.</p>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all duration-200 font-medium text-slate-800 shadow-sm"
            />
          </div>
        </div>

        <div className="flex justify-end sticky bottom-8 z-10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all duration-300 font-bold tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] hover:-translate-y-1"
          >
            <Save size={20} />
            <span>{saving ? "Saving..." : (isNew ? "Publish New Post" : "Save Post Changes")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
