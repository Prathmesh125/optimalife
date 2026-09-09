import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Target, Lightbulb, Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Optima Life Sciences",
  description: "Learn about Optima Life Sciences' mission, vision, and journey in the animal health and nutrition sector.",
};

async function getPageData() {
  const doc = await adminDb.collection("pages").doc("about-us").get();
  return doc.exists ? { id: doc.id, ...doc.data() } as any : null;
}

export default async function AboutUsPage() {
  const page = await getPageData();

  if (!page) {
    notFound();
  }

  const sections = page.sections || {};
  const heroImage = page.images?.find((img: any) => img.filename.includes('white-chickens'))?.url 
    || page.images?.[0]?.url 
    || "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="About Optima Life Sciences"
              className="w-full h-full object-cover"
            />
            {/* Elegant dark purple gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a356a]/70 to-[#3a356a]/30"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md mb-6">
              About Us
            </h1>
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base font-medium drop-shadow-sm mb-6">
              <Link href="/" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                <Home size={16} />
                <span>Home</span>
              </Link>
              <span>›</span>
              <span>About Us</span>
            </div>
            
            <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase block drop-shadow-md">
              Our Story
            </span>
          </div>

          {/* Wavy bottom divider / clean white gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* ================= WELCOME / JOURNEY ================= */}
        <article className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
          
          {sections.hero?.text && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a356a] mb-8">{sections.hero?.title || "Welcome To OPTIMA"}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                <ReactMarkdown>{sections.hero.text}</ReactMarkdown>
              </p>
            </div>
          )}

          {sections.journey?.text && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a356a] mb-8">{sections.journey?.title || "Our Journey"}</h2>
              <div className="text-lg text-slate-600 leading-relaxed mb-10">
                <ReactMarkdown>{sections.journey.text}</ReactMarkdown>
              </div>
              {sections.journey.imageUrl && (
                 <div className="my-12 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] group">
                   <img src={sections.journey.imageUrl} alt="Our Journey" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
                 </div>
              )}
            </div>
          )}

          {sections.values?.text && (
             <div className="mb-20">
               <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a356a] mb-8">{sections.values?.title || "Our Values"}</h2>
               <div className="text-lg text-slate-600 leading-relaxed">
                 <ReactMarkdown>{sections.values.text}</ReactMarkdown>
               </div>
             </div>
          )}

        </article>

        {/* ================= DYNAMIC CARDS SECTION (MISSION/VISION) ================= */}
        {(sections.vision || sections.mission) && (
          <section className="bg-white py-24 border-t border-slate-100">
            <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
              
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-[#3a356a]">Our Core Purpose</h2>
                <div className="w-16 h-1 bg-[#6C63FF] mx-auto mt-6 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* Vision Card */}
                {sections.vision?.text && (
                  <div className="bg-[#f8fafc] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                    <div className="w-14 h-14 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center text-[#6C63FF] mb-6 group-hover:scale-110 transition-transform">
                      <Lightbulb size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#3a356a] mb-4">{sections.vision.title || "Our Vision"}</h3>
                    <div className="text-slate-600 leading-relaxed">
                      <ReactMarkdown components={{ p: ({node, ...props}:any) => <p {...props} /> }}>
                        {sections.vision.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Mission Card */}
                {sections.mission?.text && (
                  <div className="bg-[#f8fafc] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <Target size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#3a356a] mb-4">{sections.mission.title || "Our Mission"}</h3>
                    <div className="text-slate-600 leading-relaxed">
                      <ReactMarkdown components={{ p: ({node, ...props}:any) => <p {...props} /> }}>
                        {sections.mission.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= PROMOTING SOCIAL GOOD ================= */}
        {sections.socialGood?.text && (
          <section className="bg-[#f5f4ef] py-24 border-t border-slate-200">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="text-4xl font-extrabold text-[#3a356a] uppercase tracking-wide mb-6">{sections.socialGood.title || "Promoting Social Good"}</h2>
                <div className="text-slate-600 text-lg leading-relaxed">
                  <ReactMarkdown components={{ p: ({node, ...props}:any) => <p {...props} /> }}>
                    {sections.socialGood.text}
                  </ReactMarkdown>
                </div>
              </div>
              
              {sections.socialGood.images && sections.socialGood.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sections.socialGood.images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3]">
                      <img src={imgUrl} alt="Social Good Activity" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= OUR FOUNDATIONS FOR ACHIEVEMENT ================= */}
        {sections.foundations?.text && (
          <section className="bg-white py-24">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="text-4xl font-extrabold text-[#3a356a] uppercase tracking-wide mb-6">{sections.foundations.title || "Our Foundations For Achievement"}</h2>
                <div className="text-slate-600 text-lg leading-relaxed">
                  <ReactMarkdown components={{ p: ({node, ...props}:any) => <p {...props} /> }}>
                    {sections.foundations.text}
                  </ReactMarkdown>
                </div>
              </div>
              
              {sections.foundations.imageUrl && (
                <div className="rounded-[40px] overflow-hidden shadow-2xl mx-auto max-w-5xl">
                  <img src={sections.foundations.imageUrl} alt="Our Foundations Team" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
