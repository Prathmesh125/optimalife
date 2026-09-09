"use client";

import { useEffect, useState, use, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Calendar, CheckCircle2, FileImage, Trash2, Loader2, Type, Heading, ChevronUp, ChevronDown, Plus, X } from "lucide-react";
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
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [images, setImages] = useState<BlogImage[]>([]); 
  const [scheduledDate, setScheduledDate] = useState("");
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    async function fetchBlog() {
      try {
        const docRef = doc(db, "blog_posts", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setImages(data.images || []);
          
          if (data.scheduledDate) {
            setScheduledDate(new Date(data.scheduledDate).toISOString().slice(0, 16));
          }

          if (data.blocks && data.blocks.length > 0) {
            setBlocks(data.blocks);
          } else if (data.content) {
            setBlocks([{ id: `block-${Date.now()}`, type: "text", content: data.content }]);
          } else {
            setBlocks([]);
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
        content: "", // We no longer use legacy content field
        blocks,
        images, // preserve to pick the featured hero image later
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

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (isNew) {
      alert("Please save the blog post once before uploading images.");
      e.target.value = "";
      return;
    }

    const blockId = blocks[idx].id;
    setUploadingBlockId(blockId);
    
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
      await updateDoc(doc(db, "blog_posts", slug), { images: updatedImages });

      updateBlock(idx, { url: data.url });

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploadingBlockId(null);
      e.target.value = "";
    }
  };

  const addBlock = (type: "text" | "image" | "heading", index: number) => {
    const newBlock: ContentBlock = { id: `block-${Date.now()}`, type, content: "", url: "", caption: "" };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
    setActiveMenuIndex(null);
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blogs" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200">
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

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Title */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 outline-none transition-all duration-200 text-[#3a356a] font-black text-4xl lg:text-5xl placeholder-slate-200"
            required
            placeholder="Post Title..."
          />
        </div>

        {/* Content Blocks Editor */}
        <div className="bg-white px-8 py-12 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 min-h-[500px]">
          
          <div className="space-y-2">
            {blocks.map((block, idx) => (
              <div key={block.id} className="relative group">
                
                <div className="p-4 border border-transparent hover:border-slate-200 rounded-2xl transition-all duration-200 relative bg-white">
                  
                  {/* Block Controls */}
                  <div className="absolute top-4 -right-12 md:-right-16 flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 p-1 rounded-xl shadow-sm z-20">
                    <button type="button" onClick={() => moveBlock(idx, "up")} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-[#6C63FF] hover:bg-slate-50 rounded-lg disabled:opacity-30">
                      <ChevronUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-[#6C63FF] hover:bg-slate-50 rounded-lg disabled:opacity-30">
                      <ChevronDown size={16} />
                    </button>
                    <div className="w-4 h-px bg-slate-200 my-1"></div>
                    <button type="button" onClick={() => removeBlock(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Block Content Inputs */}
                  {block.type === "heading" && (
                    <input
                      type="text"
                      value={block.content || ""}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 outline-none text-3xl font-bold text-[#3a356a] placeholder-slate-300"
                      placeholder="Heading 2..."
                    />
                  )}

                  {block.type === "text" && (
                    <textarea
                      value={block.content || ""}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      rows={Math.max(3, (block.content?.split("\n").length || 1))}
                      className="w-full bg-transparent border-none focus:ring-0 outline-none font-sans text-lg text-slate-700 leading-loose placeholder-slate-300 resize-none overflow-hidden"
                      placeholder="Write your paragraph here..."
                      onInput={(e) => {
                        e.currentTarget.style.height = 'auto';
                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                      }}
                    />
                  )}

                  {block.type === "image" && (
                    <div className="group/image relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      {block.url ? (
                        <>
                          <img src={block.url} alt="Preview" className="w-full h-auto object-cover max-h-[600px]" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <input
                              type="text"
                              value={block.caption || ""}
                              onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                              className="w-full bg-transparent border-none focus:ring-0 outline-none text-center text-sm font-medium text-white placeholder-white/50"
                              placeholder="Add a caption..."
                            />
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover/image:opacity-100 transition-opacity">
                            <label className="bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-white shadow-sm flex items-center space-x-2">
                              <ImageIcon size={16} />
                              <span>Replace Image</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleInlineImageUpload(e, idx)} disabled={uploadingBlockId === block.id} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
                          {uploadingBlockId === block.id ? (
                            <div className="flex flex-col items-center space-y-4">
                              <Loader2 className="animate-spin text-[#6C63FF]" size={40} />
                              <p className="text-slate-500 font-medium">Uploading image...</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100 text-slate-300">
                                <ImageIcon size={32} />
                              </div>
                              <label className="bg-[#6C63FF] text-white px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-[#5b54d6] transition-colors shadow-md hover:shadow-lg inline-flex items-center space-x-2">
                                <Plus size={18} />
                                <span>Upload an Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleInlineImageUpload(e, idx)} />
                              </label>
                              <p className="text-slate-400 text-sm mt-4 max-w-sm">
                                Or manually paste an image URL below:
                              </p>
                              <input
                                type="text"
                                value={block.url || ""}
                                onChange={(e) => updateBlock(idx, { url: e.target.value })}
                                className="mt-3 w-full max-w-sm px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#6C63FF]/30 text-sm text-center"
                                placeholder="https://example.com/image.jpg"
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Add Button (Below block) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuIndex(activeMenuIndex === idx ? null : idx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${activeMenuIndex === idx ? 'bg-[#6C63FF] text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF]'}`}
                    >
                      {activeMenuIndex === idx ? <X size={16} /> : <Plus size={16} />}
                    </button>
                    
                    {activeMenuIndex === idx && (
                      <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex items-center space-x-1">
                        <button type="button" onClick={() => addBlock("heading", idx + 1)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                          <Heading size={16} className="text-slate-400" /> <span>Heading</span>
                        </button>
                        <button type="button" onClick={() => addBlock("text", idx + 1)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                          <Type size={16} className="text-slate-400" /> <span>Text</span>
                        </button>
                        <button type="button" onClick={() => addBlock("image", idx + 1)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                          <ImageIcon size={16} className="text-slate-400" /> <span>Image</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {blocks.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center">
                <button type="button" onClick={() => addBlock("text", 0)} className="text-slate-400 hover:text-[#6C63FF] transition-colors flex flex-col items-center">
                  <Plus size={48} className="mb-4 text-slate-200" />
                  <span className="font-bold text-xl">Start writing...</span>
                </button>
              </div>
            )}
            
            {/* Bottom Add Block */}
            {blocks.length > 0 && (
              <div className="pt-12 pb-12 flex justify-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenuIndex(activeMenuIndex === blocks.length ? null : blocks.length)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-sm transition-all ${activeMenuIndex === blocks.length ? 'bg-[#6C63FF] text-white' : 'bg-slate-50 text-slate-600 hover:bg-white hover:text-[#6C63FF] border border-slate-200 hover:border-[#6C63FF]'}`}
                  >
                    {activeMenuIndex === blocks.length ? <X size={18} /> : <Plus size={18} />}
                    <span>Add Block</span>
                  </button>
                  
                  {activeMenuIndex === blocks.length && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex items-center space-x-1 z-20">
                      <button type="button" onClick={() => addBlock("heading", blocks.length)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                        <Heading size={16} className="text-slate-400" /> <span>Heading</span>
                      </button>
                      <button type="button" onClick={() => addBlock("text", blocks.length)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                        <Type size={16} className="text-slate-400" /> <span>Text</span>
                      </button>
                      <button type="button" onClick={() => addBlock("image", blocks.length)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm whitespace-nowrap">
                        <ImageIcon size={16} className="text-slate-400" /> <span>Image</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
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

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 flex justify-end px-8">
          <div className="max-w-4xl w-full mx-auto flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-[#6C63FF] text-white px-10 py-4 rounded-full hover:bg-[#5b54d6] disabled:opacity-50 transition-all duration-300 font-bold tracking-wide shadow-lg hover:-translate-y-1"
            >
              <Save size={20} />
              <span>{saving ? "Saving..." : (isNew ? "Publish New Post" : "Save Post Changes")}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
