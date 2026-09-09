"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { submitApplication } from "@/app/actions/applyJob";
import ReactMarkdown from "react-markdown";
import { Briefcase, MapPin, UploadCloud, CheckCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export default function CareersPage() {
  const [header, setHeader] = useState<{title?: string, subtitle?: string}>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      try {
        // Fetch page header
        const docRef = doc(db, "pages", "careers");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const sections = docSnap.data().sections || {};
          setHeader(sections.header || {});
        }
        
        // Fetch jobs from 'careers' collection
        const jobsQuery = query(collection(db, "careers")); // Fetch all to filter client-side for dynamic scheduling
        const jobsSnap = await getDocs(jobsQuery);
        const now = new Date();
        
        const activeJobs = jobsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter((job: any) => {
          // Dynamic status logic
          if (job.status === 'closed') return false;
          if (job.status === 'active') return true;
          
          if (job.status === 'scheduled_active') {
            return job.scheduledDate && now >= new Date(job.scheduledDate);
          }
          
          if (job.status === 'scheduled_close') {
            return job.scheduledDate && now < new Date(job.scheduledDate);
          }
          
          // Legacy fallback for old data without 'status' field
          return job.active === true;
        }) as Job[];
        
        setJobs(activeJobs);
      } catch (err) {
        console.error("Error fetching careers data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, []);

    }
    fetchPageData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="max-w-3xl mb-16 text-center mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary-light)]/20 text-[var(--color-primary)] text-sm font-semibold tracking-wider mb-4 border border-[var(--color-primary-light)]/30">
              JOIN OUR TEAM
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-primary)] font-bold mb-6">
              {header.title || "Build the Future of Animal Health"}
            </h1>
            <p className="text-lg text-slate-600">
              {header.subtitle || "We are always looking for passionate, driven individuals to join our team in Pune and across India. Explore our open positions below."}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading open positions...</div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {jobs.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <p className="text-slate-500 text-lg">No open positions right now. Check back later!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {jobs.map(job => (
                    <Link href={`/careers/${job.id}`} key={job.id} className="block group">
                      <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-[var(--color-primary-light)]/50 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center space-x-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100"><Briefcase size={16}/> <span>{job.type || "Full-Time"}</span></span>
                            <span className="flex items-center space-x-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100"><MapPin size={16}/> <span>{job.location || "Pune, MH"}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-[var(--color-primary)] font-bold">
                          <span>View Details</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
