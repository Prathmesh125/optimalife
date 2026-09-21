"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { logAdminAction } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Package, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ProductEditor({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const isNew = slug === "new";
  
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("feed-additives");
  const [subCategory, setSubCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [features, setFeatures] = useState("");
  const [dosage, setDosage] = useState("");
  const [availablePacks, setAvailablePacks] = useState("5L, 25L, 200L");
  const [targetSpecies, setTargetSpecies] = useState("Broilers, Layers, Breeders");
  const [featuredImage, setFeaturedImage] = useState("");
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  
  // To deal with legacy images array if present
  const [imagesArray, setImagesArray] = useState<any[]>([]);

  useEffect(() => {
    if (isNew) return;
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setCategory(data.category || "feed-additives");
          setSubCategory(data.subCategory || "");
          setShortDescription(data.shortDescription || "");
          setContent(data.content || "");
          setFeatures(data.features || "");
          setDosage(data.dosage || "");
          
          if (data.availablePacks) {
            setAvailablePacks(Array.isArray(data.availablePacks) ? data.availablePacks.join(", ") : data.availablePacks);
          }
          if (data.targetSpecies) {
            setTargetSpecies(Array.isArray(data.targetSpecies) ? data.targetSpecies.join(", ") : data.targetSpecies);
          }
          
          setFeaturedImage(data.image || "");
          setImagesArray(data.images || []);
          
        } else {
          setMessage("Product not found.");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, isNew]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const docId = isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : slug;
      const docRef = doc(db, "products", docId);
      
      const payload = {
        title,
        category,
        subCategory,
        shortDescription,
        content,
        features,
        dosage,
        availablePacks: availablePacks.split(",").map(s => s.trim()).filter(Boolean),
        targetSpecies: targetSpecies.split(",").map(s => s.trim()).filter(Boolean),
        image: featuredImage,
        images: imagesArray, // Keep legacy if needed
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        await setDoc(docRef, payload);
        await logAdminAction("PRODUCT_CREATED", auth.currentUser?.email || "Unknown", `Created product: ${title}`);
        setIsDirty(false);
        router.push(`/admin/products/${docId}`);
      } else {
        await updateDoc(docRef, payload);
        await logAdminAction("PRODUCT_UPDATED", auth.currentUser?.email || "Unknown", `Updated product: ${title}`);
        setIsDirty(false);
        setMessage("Product saved successfully!");
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
      alert("Please save the product once before uploading images.");
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `products/${slug}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFeaturedImage(data.url);
      setIsDirty(true);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C63FF]"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">
              {isNew ? "Add New Product" : "Edit Product"}
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
        
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Product Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all font-bold text-[#3a356a]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Category *</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setIsDirty(true); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all font-bold text-[#3a356a]"
              >
                <option value="feed-additives">Feed Additives</option>
                <option value="bio-security">Bio Security</option>
                <option value="dosing-system">Dosing System</option>
                <option value="optiserve">Optiserve</option>
              </select>
            </div>
          </div>

          {category === "feed-additives" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Sub Category</label>
              <select
                value={subCategory}
                onChange={(e) => { setSubCategory(e.target.value); setIsDirty(true); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all font-bold text-[#3a356a]"
              >
                <option value="">None</option>
                <option value="cost-effective">Cost Effective Performance Solutions</option>
                <option value="gut-health">Gut Health Solutions</option>
                <option value="enzyme">Enzyme Solutions</option>
                <option value="feed-quality">Feed Quality and Milling Solutions</option>
                <option value="mineral">Mineral Solutions</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Short Description</label>
            <textarea
              value={shortDescription}
              onChange={(e) => { setShortDescription(e.target.value); setIsDirty(true); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all text-slate-700 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Details / Overview (Markdown supported)</label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all text-slate-700 min-h-[200px]"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6">
          <h3 className="text-xl font-extrabold text-[#3a356a]">Product Specifics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Available Packs (comma separated)</label>
                <input
                  type="text"
                  value={availablePacks}
                  onChange={(e) => { setAvailablePacks(e.target.value); setIsDirty(true); }}
                  placeholder="5L, 25L, 200L"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Target Species (comma separated)</label>
                <input
                  type="text"
                  value={targetSpecies}
                  onChange={(e) => { setTargetSpecies(e.target.value); setIsDirty(true); }}
                  placeholder="Broilers, Layers, Breeders"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Features & Benefits (Markdown supported)</label>
            <textarea
              value={features}
              onChange={(e) => { setFeatures(e.target.value); setIsDirty(true); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all text-slate-700 min-h-[150px]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Dosage (Markdown supported)</label>
            <textarea
              value={dosage}
              onChange={(e) => { setDosage(e.target.value); setIsDirty(true); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] outline-none transition-all text-slate-700 min-h-[100px]"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
           <h3 className="text-xl font-extrabold text-[#3a356a] mb-6">Product Image</h3>
           <div className="flex items-center space-x-6">
              <div className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                 {featuredImage ? (
                    <>
                       <img src={featuredImage} alt="Featured" className="w-full h-full object-contain" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="bg-white text-[#3a356a] px-4 py-2 rounded-lg font-bold text-sm cursor-pointer shadow-lg hover:scale-105 transition-transform">
                             Change
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                       </div>
                    </>
                 ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#6C63FF] transition-colors w-full h-full">
                       <ImageIcon size={32} className="mb-2" />
                       <span className="font-bold text-sm">Upload Image</span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                 )}
              </div>
              <div className="text-slate-500 text-sm max-w-sm">
                 <p className="mb-2"><strong>Tip:</strong> Use high-quality transparent PNGs or JPGs for best results on the product page.</p>
                 <p>Image should ideally have a 1:1 or 4:3 aspect ratio.</p>
              </div>
           </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 flex justify-end px-8">
          <div className="max-w-4xl w-full mx-auto flex justify-end space-x-4">
            <button
              type="button"
              onClick={(e) => handleSave(e)}
              disabled={saving}
              className="flex items-center space-x-2 bg-[#6C63FF] text-white px-10 py-4 rounded-full hover:bg-[#5b54d6] disabled:opacity-50 transition-all duration-300 font-bold tracking-wide shadow-lg hover:-translate-y-1"
            >
              <Save size={20} />
              <span>{saving ? "Saving..." : "Save Product"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
