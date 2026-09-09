"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Edit2, Plus, Calendar, FileText, CheckCircle2, Clock, Trash2 } from "lucide-react";

interface BlogDoc {
  slug: string;
  title: string;
  updatedAt: string;
  scheduledDate?: string;
  status?: string;
}

export default function AdminBlogsList() {
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const q = query(collection(db, "blog_posts")); 
        const querySnapshot = await getDocs(q);
        const blogsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            slug: doc.id,
            title: data.title || doc.id,
            updatedAt: data.updatedAt,
            scheduledDate: data.scheduledDate,
            status: data.status,
          };
        });
        setBlogs(blogsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const handleDelete = async (slug: string) => {
    if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "blog_posts", slug));
        setBlogs(prev => prev.filter(b => b.slug !== slug));
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Blog Posts</h1>
          <p className="text-slate-500 font-medium mt-1">Manage, write, and schedule your articles.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="flex items-center space-x-2 bg-[#6C63FF] text-white px-6 py-3 rounded-xl hover:bg-[#5a52d5] shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all duration-300 font-bold tracking-wide"
        >
          <Plus size={20} />
          <span>Create New Post</span>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Post Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.map((blog) => {
                const isScheduled = blog.scheduledDate && new Date(blog.scheduledDate) > new Date();
                const isDraft = blog.status === "draft";
                return (
                  <tr key={blog.slug} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-slate-800">{blog.title.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isDraft ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          <FileText size={14} />
                          <span>Draft</span>
                        </span>
                      ) : isScheduled ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700">
                          <Clock size={14} />
                          <span>Scheduled: {new Date(blog.scheduledDate!).toLocaleDateString()}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <CheckCircle2 size={14} />
                          <span>Published</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                      {new Date(blog.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/blogs/${blog.slug}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                          title="Edit Blog"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.slug)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 hover:shadow-md hover:bg-red-50 transition-all duration-200"
                          title="Delete Blog"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No blog posts found. Click "Create New Post" to get started.
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
