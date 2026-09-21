"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { auth } from "@/lib/firebase/client";
import { logAdminAction } from "@/lib/logger";
import Link from "next/link";
import { Edit2, Plus, Package, Trash2 } from "lucide-react";

interface ProductDoc {
  slug: string;
  title: string;
  category: string;
  updatedAt: string;
}

export default function AdminProductsList() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products")); 
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            slug: doc.id,
            title: data.title || doc.id,
            category: data.category || "Uncategorized",
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
        });
        
        // Filter out category pages that aren't real products
        const invalidSlugs = ["products_main", "products_bio-security-2", "products_dosing-system-2"];
        const validProducts = productsData.filter(p => !invalidSlugs.includes(p.slug) && !p.slug.startsWith('products_feed-additives'));
        
        setProducts(validProducts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (slug: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "products", slug));
        setProducts(prev => prev.filter(p => p.slug !== slug));
        
        // Audit log
        await logAdminAction("PRODUCT_DELETED", auth.currentUser?.email || "Unknown", `Deleted product: ${slug}`);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your product offerings, categories, and details.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center space-x-2 bg-[#6C63FF] text-white px-6 py-3 rounded-xl hover:bg-[#5a52d5] shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all duration-300 font-bold tracking-wide"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </Link>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.slug} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Package size={18} />
                      </div>
                      <span className="font-bold text-slate-800">{product.title.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 capitalize">
                      {product.category.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                    {new Date(product.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 hover:shadow-md hover:bg-red-50 transition-all duration-200"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No products found. Click "Add New Product" to get started.
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
