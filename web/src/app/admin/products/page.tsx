"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, deleteDoc, doc, orderBy, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { auth } from "@/lib/firebase/client";
import { logAdminAction } from "@/lib/logger";
import Link from "next/link";
import { Edit2, Plus, Trash2, Folder, Layers, ArrowRight, GripVertical } from "lucide-react";
import * as Icons from "lucide-react";

interface CategoryDoc {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
  subcategories: any[];
}

export default function AdminCategoriesList() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const q = query(collection(db, "productCategories"), orderBy("order", "asc")); 
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CategoryDoc[];
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "productCategories", id));
        setCategories(prev => prev.filter(c => c.id !== id));
        
        // Audit log
        await logAdminAction("CATEGORY_DELETED", auth.currentUser?.email || "Unknown", `Deleted category: ${id}`);
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    dragItem.current = index;
    // Add small delay so the dragged ghost image isn't also transparent
    setTimeout(() => {
      if (e.target && (e.target as HTMLElement).classList) {
        (e.target as HTMLElement).classList.add("opacity-50");
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    if (dragItem.current === null) return;
    
    dragOverItem.current = index;
    const items = [...categories];
    const draggedItemContent = items[dragItem.current];
    
    // Remove the item from original position
    items.splice(dragItem.current, 1);
    // Insert at new position
    items.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    
    setCategories(items);
  };

  const handleDragEnd = async (e: React.DragEvent<HTMLTableRowElement>) => {
    if (e.target && (e.target as HTMLElement).classList) {
      (e.target as HTMLElement).classList.remove("opacity-50");
    }
    dragItem.current = null;
    dragOverItem.current = null;

    // Save to firestore
    await saveNewOrder(categories);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault(); // necessary to allow drop
  };

  const saveNewOrder = async (items: CategoryDoc[]) => {
    setSavingOrder(true);
    try {
      const batch = writeBatch(db);
      let changed = false;
      
      const newItems = items.map((cat, index) => {
        const newOrder = index + 1;
        if (cat.order !== newOrder) {
          batch.update(doc(db, "productCategories", cat.id), { order: newOrder });
          changed = true;
          return { ...cat, order: newOrder };
        }
        return cat;
      });
      
      if (changed) {
        await batch.commit();
        setCategories(newItems);
        await logAdminAction("CATEGORY_UPDATED", auth.currentUser?.email || "Unknown", "Reordered product categories");
      }
    } catch (error) {
      console.error("Error saving new order:", error);
      alert("Failed to save the new order. Please refresh and try again.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Product Categories</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center">
            Manage your main product categories and their subcategories. 
            {savingOrder && <span className="ml-3 text-xs font-bold text-[#6C63FF] bg-indigo-50 px-2 py-1 rounded-md animate-pulse">Saving order...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/items"
            className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 shadow-sm transition-all duration-300 font-bold tracking-wide"
          >
            <Layers size={20} />
            <span>View All Products</span>
          </Link>
          <Link
            href="/admin/products/categories/new"
            className="flex items-center space-x-2 bg-[#6C63FF] text-white px-6 py-3 rounded-xl hover:bg-[#5a52d5] shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all duration-300 font-bold tracking-wide"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Category Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Subcategories</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category, index) => {
                const IconComp = (Icons as any)[category.icon] || Folder;
                return (
                  <tr 
                    key={category.id} 
                    className={`hover:bg-slate-50/80 transition-colors group ${savingOrder ? 'pointer-events-none' : ''}`}
                    draggable={!savingOrder}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 transition-colors">
                           <GripVertical size={20} />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6C63FF]">
                          <IconComp size={24} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-lg">{category.name}</span>
                          <span className="text-sm text-slate-500 line-clamp-1">{category.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {category.subcategories?.length || 0} Subcategories
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/products/categories/${category.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                          title="Edit Category & Subcategories"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 hover:shadow-md hover:bg-red-50 transition-all duration-200"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No categories found. Click "Add Category" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
