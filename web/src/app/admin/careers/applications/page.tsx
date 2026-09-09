"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface ApplicationDoc {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl: string;
  submittedAt: string;
}

export default function AdminApplicationsList() {
  const [applications, setApplications] = useState<ApplicationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const querySnapshot = await getDocs(collection(db, "applications"));
        const appsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            jobId: data.jobId,
            applicantName: data.applicantName,
            applicantEmail: data.applicantEmail,
            applicantPhone: data.applicantPhone,
            resumeUrl: data.resumeUrl,
            submittedAt: data.submittedAt,
          };
        });
        setApplications(appsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/careers" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Applicant Tracking</h1>
      </div>
      
      {loading ? (
        <div>Loading applications...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-slate-700">Applicant</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-700">Job Reference</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-700">Date Submitted</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-700 text-right">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{app.applicantName}</div>
                    <div className="text-sm text-slate-500">{app.applicantEmail}</div>
                    <div className="text-sm text-slate-500">{app.applicantPhone}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {app.jobId}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(app.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-md"
                    >
                      <FileText size={16} />
                      <span>View Resume</span>
                    </a>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No applications received yet.
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
