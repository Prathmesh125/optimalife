import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Optiserve | Optima Life Sciences",
  description: "Unique product technologies and consulting that support poultry health, diagnostics, and performance in every stage of production.",
};

async function getPageData() {
  const doc = await adminDb.collection("pages").doc("optiserve").get();
  return doc.exists ? { id: doc.id, ...doc.data() } as any : null;
}

export default async function OptiservePage() {
  const page = await getPageData();

  if (!page) {
    notFound();
  }

  const sections = page.sections || {};
  
  const heroImage = sections.hero?.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop";
  const intro = sections.intro || {};
  const infographic = sections.infographic || {};
  const servicesList = sections.services || [];

  const TableComponents = {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left text-slate-600" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => <thead className="text-xs text-white uppercase bg-[#3a356a]" {...props} />,
    th: ({ node, ...props }: any) => <th className="px-4 py-3 font-semibold tracking-wider border-b border-slate-200 whitespace-nowrap" {...props} />,
    td: ({ node, ...props }: any) => <td className="px-4 py-3 border-b border-slate-100 min-w-[120px]" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="hover:bg-slate-50 transition-colors" {...props} />,
    p: ({ node, ...props }: any) => <p className="mb-3 text-slate-600 leading-relaxed text-sm md:text-base" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-600 text-sm md:text-base" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-[#3a356a]" {...props} />,
  };

  const blobShapes = [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '30% 70% 70% 30% / 30% 30% 70% 70%',
    '50% 50% 20% 80% / 25% 80% 20% 75%',
    '40% 60% 70% 30% / 40% 50% 60% 50%',
    '20% 80% 60% 40% / 50% 30% 70% 50%',
    '80% 20% 40% 60% / 40% 70% 30% 60%',
    '60% 40% 50% 50% / 30% 60% 40% 70%',
    '40% 60% 30% 70% / 60% 40% 60% 40%',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Optiserve Landscape"
              className="w-full h-full object-cover"
            />
            {/* Elegant dark overlay similar to mockup */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a356a]/60 to-[#3a356a]/20"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
              {sections.hero?.title || "Optiserve"}
            </h1>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* ================= INTRO SECTION ================= */}
        {(intro.text || intro.image) && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {intro.text && (
                  <div className="lg:w-1/2">
                    <ReactMarkdown components={TableComponents}>
                      {intro.text}
                    </ReactMarkdown>
                  </div>
                )}
                {intro.image && (
                  <div className="lg:w-1/2 flex justify-center">
                    <div className="relative w-full max-w-lg rounded-tl-[80px] rounded-br-[80px] rounded-tr-3xl rounded-bl-3xl overflow-hidden shadow-2xl border-4 border-indigo-50">
                      <img src={intro.image} alt="Optiserve Intro" className="w-full h-auto object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= CIRCULAR INFOGRAPHIC ================= */}
        {infographic.image && (
          <section className="bg-[#6b679b] py-16 flex justify-center items-center px-4 shadow-inner">
            <div className="max-w-5xl w-full">
              <img src={infographic.image} alt="Optiserve Infographic" className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
            </div>
          </section>
        )}

        {/* ================= ZIG-ZAG SERVICES SECTION ================= */}
        {servicesList.length > 0 && (
          <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl space-y-32">
              
              {servicesList.map((service: any, idx: number) => {
                const isEven = idx % 2 !== 0;
                const blobShape = blobShapes[idx % blobShapes.length];

                return (
                  <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
                    
                    {/* Image Blob */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                      {service.image ? (
                        <div 
                          className="w-72 h-72 md:w-96 md:h-96 overflow-hidden shadow-[0_20px_50px_rgb(58,53,106,0.2)] relative group"
                          style={{ borderRadius: blobShape, transition: 'all 0.5s ease-in-out' }}
                        >
                          <img 
                            src={service.image} 
                            alt={service.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute inset-0 bg-[#3a356a]/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                      ) : (
                        <div className="hidden lg:block w-72 h-72"></div>
                      )}
                    </div>

                    {/* Text Card */}
                    <div className="w-full lg:w-1/2">
                      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100 relative">
                        <div className="absolute top-0 left-10 w-24 h-1.5 bg-[#3a356a] rounded-b-md"></div>
                        
                        <h3 className="text-2xl md:text-3xl font-extrabold text-[#3a356a] mb-6 flex items-center gap-4">
                          <span className="text-emerald-500 font-black text-xl">{service.id}</span>
                          {service.title}
                        </h3>
                        
                        <div className="prose-custom max-w-none">
                          <ReactMarkdown components={TableComponents}>
                            {service.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
