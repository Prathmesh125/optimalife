"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Edit2, LayoutTemplate } from "lucide-react";

interface PageDoc {
  slug: string;
  title: string;
  updatedAt: string;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPages() {
      try {
        const querySnapshot = await getDocs(collection(db, "pages"));
        const pagesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            slug: doc.id,
            title: data.title || doc.id,
            updatedAt: data.updatedAt,
          };
        });
        setPages(pagesData);
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPages();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Website Pages</h1>
          <p className="text-slate-500 font-medium mt-1">Manage the core content of your website.</p>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Page Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Slug</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.slug} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <LayoutTemplate size={18} />
                      </div>
                      <span className="font-bold text-slate-800">{page.title.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-600">
                      /{page.slug}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                    {new Date(page.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                      title="Edit Page"
                    >
                      <Edit2 size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">No pages found.</p>
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
