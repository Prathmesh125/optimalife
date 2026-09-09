"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Trash2, MessageSquare, Mail, Phone, Calendar } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: any;
  status: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Inquiry[];
      setInquiries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
      } catch (error) {
        console.error("Error deleting inquiry:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <MessageSquare className="mr-3 text-[#6C63FF]" />
            Inquiries
          </h1>
          <p className="text-slate-500 mt-2">Manage messages received from the Connect with Us form.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <MessageSquare size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No inquiries found. When visitors contact you, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Visitor</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <div className="font-bold text-slate-800">{inquiry.name || "Anonymous"}</div>
                      <div className="text-xs text-emerald-500 font-medium uppercase tracking-wider mt-1 border border-emerald-200 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">
                        {inquiry.status || "New"}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 text-slate-400" />
                          <a href={`mailto:${inquiry.email}`} className="hover:text-[#6C63FF] hover:underline">
                            {inquiry.email}
                          </a>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-slate-400" />
                            <a href={`tel:${inquiry.phone}`} className="hover:text-[#6C63FF] hover:underline">
                              {inquiry.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-slate-400" />
                        {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleString() : "Unknown Date"}
                      </div>
                    </td>
                    <td className="p-4 pr-6 align-top text-right">
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
