"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { auth } from "@/lib/firebase/client";
import { logAdminAction } from "@/lib/logger";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Plus, Trash2, LayoutGrid } from "lucide-react";
import * as Icons from "lucide-react";

// Curated list of high-quality Lucide icons for categories
const AVAILABLE_ICONS = [
  "Package", "Shield", "Settings", "Zap", "Beaker", "Leaf", "Droplet", "Activity", "Box", "Layers"
];

interface Subcategory {
  id: string;
  name: string;
}

interface CategoryData {
  name: string;
  description: string;
  icon: string;
  order: number;
  subcategories: Subcategory[];
}

export default function CategoryEditor() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const categoryId = isNew ? "" : (params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<CategoryData>({
    name: "",
    description: "",
    icon: "Package",
    order: 0,
    subcategories: [],
  });

  // State for subcategory being added
  const [newSubId, setNewSubId] = useState("");
  const [newSubName, setNewSubName] = useState("");

  useEffect(() => {
    async function fetchCategory() {
      if (isNew) return;
      try {
        const docRef = doc(db, "productCategories", categoryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as CategoryData);
        } else {
          alert("Category not found!");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [categoryId, isNew, router]);

  const handleSave = async () => {
    if (!data.name) {
      alert("Category name is required");
      return;
    }
    
    // Generate an ID if new
    const idToSave = isNew ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : categoryId;
    
    setSaving(true);
    try {
      await setDoc(doc(db, "productCategories", idToSave), data);
      
      await logAdminAction(
        isNew ? "CATEGORY_CREATED" : "CATEGORY_UPDATED",
        auth.currentUser?.email || "Unknown",
        `${isNew ? 'Created' : 'Updated'} category: ${idToSave}`
      );

      if (isNew) {
        router.push(`/admin/products/categories/${idToSave}`);
      } else {
        alert("Category saved successfully!");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubId || !newSubName) {
      alert("Subcategory ID and Name are required");
      return;
    }
    
    // Check for duplicates
    if (data.subcategories.some(s => s.id === newSubId)) {
      alert("A subcategory with this ID already exists.");
      return;
    }

    setData(prev => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), { id: newSubId, name: newSubName }]
    }));
    
    setNewSubId("");
    setNewSubName("");
  };

  const handleRemoveSubcategory = (idToRemove: string) => {
    if (window.confirm("Remove this subcategory?")) {
      setData(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter(s => s.id !== idToRemove)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]"></div>
      </div>
    );
  }

  const SelectedIcon = (Icons as any)[data.icon] || Icons.Folder;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-[#6C63FF] hover:shadow-md transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">
              {isNew ? "Create Category" : "Edit Category"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Configure category details and manage its subcategories.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-[#6C63FF] text-white px-8 py-3 rounded-xl hover:bg-[#5a52d5] shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all duration-300 font-bold tracking-wide disabled:opacity-50"
        >
          <Save size={20} />
          <span>{saving ? "Saving..." : "Save Category"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Category Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Category Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none transition-all"
                  placeholder="e.g. Feed Additives"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none transition-all resize-none"
                  placeholder="Short description displayed on the products page..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#6C63FF] shrink-0 border border-indigo-100">
                      <SelectedIcon size={24} />
                    </div>
                    <select
                      value={data.icon}
                      onChange={(e) => setData({ ...data, icon: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none transition-all"
                    >
                      {AVAILABLE_ICONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={data.order}
                    onChange={(e) => setData({ ...data, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Subcategories */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Subcategories</h2>
            <p className="text-sm text-slate-500 mb-6">Create filters for this category.</p>

            <div className="space-y-4 mb-8">
              {(data.subcategories || []).map((sub) => (
                <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{sub.name}</span>
                      <span className="text-xs text-slate-400 font-mono">ID: {sub.id}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveSubcategory(sub.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {!isNew && (
                    <Link
                      href={`/admin/products/items?category=${categoryId}&subcategory=${sub.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 w-full bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all"
                    >
                      <LayoutGrid size={14} />
                      <span>Manage Products</span>
                    </Link>
                  )}
                </div>
              ))}

              {(data.subcategories?.length === 0 || !data.subcategories) && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-sm font-medium">No subcategories added</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Add Subcategory</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value);
                    if (!newSubId) {
                      setNewSubId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="Subcategory Name"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#6C63FF] outline-none"
                />
                <input
                  type="text"
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="ID (auto-generated)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#6C63FF] outline-none font-mono"
                />
                <button
                  onClick={handleAddSubcategory}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
