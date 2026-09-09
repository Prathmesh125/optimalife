"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { Briefcase, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  status?: string;
  active?: boolean;
}

export default function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const docRef = doc(db, "careers", slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Simple client side validation that it's active
          if (data.status === 'closed' || (data.status === undefined && data.active === false)) {
            router.push("/careers");
            return;
          }
          setJob({ id: docSnap.id, ...data } as Job);
        } else {
          router.push("/careers");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          
          <Link href="/careers" className="inline-flex items-center space-x-2 text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors mb-8">
            <ArrowLeft size={18} />
            <span>Back to all job openings</span>
          </Link>
          
          <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-slate-200">
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-primary)] font-bold mb-8">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-600 mb-12 border-b border-slate-100 pb-10">
              <span className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Briefcase size={18} className="text-[var(--color-primary-light)]"/> 
                <span>{job.type || "Full-Time"}</span>
              </span>
              <span className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <MapPin size={18} className="text-[var(--color-primary-light)]"/> 
                <span>{job.location || "Pune, MH"}</span>
              </span>
            </div>

            <div className="prose prose-lg prose-slate max-w-none mb-16 prose-headings:font-serif prose-headings:text-[var(--color-primary)] prose-a:text-blue-600 prose-li:marker:text-[var(--color-primary-light)]">
              <ReactMarkdown>{job.description}</ReactMarkdown>
            </div>

            <div className="border-t border-slate-200 pt-12 flex justify-end">
              <Link href={`/careers/${slug}/apply`} className="group flex items-center space-x-3 bg-[var(--color-primary)] text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-[#00381a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <span>Apply for this job</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
