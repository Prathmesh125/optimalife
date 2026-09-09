import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Phone, Shield, Activity, Beaker } from "lucide-react";
import HeroCarousel from "@/components/ui/HeroCarousel";
import CertificationsCarousel from "@/components/ui/CertificationsCarousel";
import GlobalMap from "@/components/ui/GlobalMap";
import AnimatedStat from "@/components/ui/AnimatedStat";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const doc = await adminDb.collection("pages").doc("home").get();
  return doc.exists ? doc.data() : null;
}

export default async function Home() {
  const data = await getHomeData();
  const sections = data?.sections || {};

  const heroSlides = sections.heroCarousel || [];
  const welcome = sections.welcome || {};
  const solutions = sections.solutions || {};
  const stats = sections.stats || [];
  const globalPresence = sections.globalPresence || {};
  const certs = sections.certifications || [];
  const news = sections.latestNews || {};

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar />

      <main className="flex-grow">
        
        {/* 1. HERO CAROUSEL */}
        <HeroCarousel slides={heroSlides} />

        {/* 2. WELCOME SECTION */}
        {(welcome.title || welcome.text) && (
          <section className="bg-white py-24 lg:py-32 px-6">
            <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
              
              <div className="w-full lg:w-1/2">
                {welcome.subtitle && (
                  <span className="inline-block py-1.5 px-4 rounded-md bg-[var(--color-base-subtle)] text-[var(--color-primary)] text-sm font-bold tracking-widest mb-6 uppercase border border-slate-200">
                    {welcome.subtitle}
                  </span>
                )}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-8" dangerouslySetInnerHTML={{ __html: welcome.title?.replace('Trust & Growth', '<span class="text-[var(--color-primary)]">Trust & Growth</span>') || "Welcome" }} />
                
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  {welcome.text}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link 
                    href="/about-us" 
                    className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all flex items-center shadow-lg shadow-blue-500/20 w-full sm:w-auto justify-center"
                  >
                    Discover Our Story <ArrowRight className="ml-2" size={20} />
                  </Link>
                  {welcome.phone && (
                    <div className="flex items-center space-x-4 border-l-2 border-slate-200 pl-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Phone className="text-[var(--color-secondary)]" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Place an order</p>
                        <p className="text-xl font-extrabold text-slate-900">{welcome.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {welcome.globeImage && (
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                  <div className="absolute inset-0 bg-[var(--color-base-subtle)] rounded-full blur-3xl opacity-50 transform translate-x-10 translate-y-10"></div>
                  <img 
                    src={welcome.globeImage} 
                    alt="Global Presence" 
                    className="w-full max-w-[600px] object-contain relative z-10 animate-[float_8s_ease-in-out_infinite]"
                  />
                </div>
              )}
            </div>
          </section>
        )}


        {/* 3. SOLUTIONS SECTION */}
        {(solutions.title || solutions.items?.length > 0) && (
          <section className="bg-[var(--color-base-subtle)] py-24 lg:py-32 px-6 border-y border-slate-200">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div className="max-w-2xl">
                  {solutions.subtitle && (
                    <span className="text-[var(--color-secondary)] font-bold text-sm tracking-widest uppercase mb-4 block">
                      {solutions.subtitle}
                    </span>
                  )}
                  <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                    {solutions.title}
                  </h2>
                </div>
                <Link href="/products" className="text-[var(--color-primary)] font-bold flex items-center hover:text-[var(--color-primary-dark)] transition-colors">
                  View All Products <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {solutions.items?.map((item: any, idx: number) => {
                  let icon = <Activity size={32} />;
                  if (item.title.includes("Feed")) icon = <Beaker size={32} />;
                  if (item.title.includes("Bio")) icon = <Shield size={32} />;

                  return (
                    <Link href="/products" key={idx} className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.title} />
                      </div>
                      <div className="p-8 flex flex-col flex-grow relative">
                        <div className="absolute -top-8 right-6 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-[var(--color-primary)] border border-slate-100 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                          {icon}
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors mt-2">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 4. STATS SECTION */}
        {stats.length > 0 && (
          <section className="bg-white py-24 px-6 border-b border-slate-200">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-slate-100">
                {stats.map((stat: any, i: number) => (
                  <div key={i} className="flex flex-col items-center justify-center p-4">
                    <AnimatedStat value={stat.value} />
                    <div className="text-slate-900 font-bold uppercase tracking-widest text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. GLOBAL PRESENCE */}
        {(globalPresence.title || globalPresence.image) && (
          <section className="bg-[var(--color-base-subtle)] py-24 px-6 border-b border-slate-200">
            <div className="container mx-auto max-w-5xl text-center">
              {globalPresence.subtitle && (
                <span className="text-[var(--color-secondary)] font-bold text-sm tracking-widest uppercase mb-4 block">
                  {globalPresence.subtitle}
                </span>
              )}
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-16">
                {globalPresence.title}
              </h2>
              
              <GlobalMap />
              
            </div>
          </section>
        )}

        {/* 6. CERTIFICATIONS */}
        {certs.length > 0 && (
          <CertificationsCarousel certs={certs} />
        )}

        {/* 7. LATEST NEWS */}
        {(news.title || news.items?.length > 0) && (
          <section className="bg-white py-24 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-100 pb-6">
                <div>
                  {news.subtitle && (
                    <span className="text-[#6C63FF] font-bold text-lg tracking-wide uppercase mb-2 block">
                      {news.subtitle}
                    </span>
                  )}
                  <h2 className="text-4xl md:text-5xl font-extrabold text-[#3a356a]">
                    {news.title}
                  </h2>
                </div>
                <Link 
                  href="/blogs" 
                  className="mt-6 md:mt-0 bg-[#6C63FF] hover:bg-[#5b54d6] text-white px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg"
                >
                  MORE POSTS
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.items?.map((blog: any, idx: number) => (
                  <Link 
                    href={blog.link || "#"} 
                    key={idx} 
                    className="group flex flex-col items-start space-y-4"
                  >
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-2 relative">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 border border-slate-900/10 rounded-2xl pointer-events-none mix-blend-overlay"></div>
                    </div>
                    <h3 className="text-xl font-bold text-[#3a356a] leading-snug group-hover:text-[#6C63FF] transition-colors">
                      {blog.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
