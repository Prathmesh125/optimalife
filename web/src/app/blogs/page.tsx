import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export const dynamic = "force-dynamic";

async function getBlogs() {
  const snapshot = await adminDb.collection("blog_posts").get();
  const blogs = snapshot.docs.map((doc: any) => {
    const data = doc.data();
    
    // Extract text from blocks if present
    let rawText = data.content || "";
    if (data.blocks && data.blocks.length > 0) {
      const textBlocks = data.blocks.filter((b: any) => b.type === "text" && b.content);
      rawText = textBlocks.map((b: any) => b.content).join(" ");
    }
    
    return {
      slug: doc.id,
      title: data.title,
      content: rawText,
      images: data.images || [],
      updatedAt: data.updatedAt,
      scheduledDate: data.scheduledDate
    };
  });
  
  // Filter out scheduled future posts and sort by date descending
  const now = new Date();
  return blogs
    .filter((b: any) => !b.scheduledDate || new Date(b.scheduledDate) <= now)
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export const metadata = {
  title: "Insights & News | Optima Life Sciences",
  description: "Read the latest insights and news from Optima Life Sciences on animal health and feed additives.",
};

export default async function BlogsPage() {
  const blogs = await getBlogs();

  // Fetch the page dynamic data (title, hero image)
  const pageDoc = await adminDb.collection("pages").doc("blogs").get();
  const pageData = pageDoc.exists ? pageDoc.data() : null;
  
  const title = pageData?.sections?.header?.title || "Insightful Blogs from Optima Life";
  const heroImage = (pageData?.images && pageData.images.length > 0) 
    ? pageData.images[0].url 
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Optima Life Sciences Blogs"
              className="w-full h-full object-cover"
            />
            {/* Elegant dark purple gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a356a]/70 to-[#3a356a]/30"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md mb-6">
              {title}
            </h1>
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base font-medium drop-shadow-sm">
              <Link href="/" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                <Home size={16} />
                <span>Home</span>
              </Link>
              <span>›</span>
              <span>{title}</span>
            </div>
          </div>

          {/* Wavy bottom divider / clean white gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* ================= BLOGS GRID ================= */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog: any) => {
                // Filter out the logos (Group-89, Group-of-12-Objects, OPTIMA-LOGO) to find the REAL featured image
                const realImages = (blog.images || []).filter((img: any) => {
                  const name = img?.filename?.toLowerCase() || '';
                  return !name.includes('group-89') && 
                         !name.includes('group-of-12-objects') && 
                         !name.includes('optima-logo');
                });

                const featuredImage = realImages.length > 0 
                  ? realImages[0].url 
                  : "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";
                
                return (
                  <Link href={`/blogs/${blog.slug}`} key={blog.slug} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300">
                    
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={featuredImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    
                    <div className="p-8 flex-grow flex flex-col relative">
                      <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 space-x-1.5">
                        <span>{new Date(blog.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-[#3a356a] mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {blog.title.toUpperCase()}
                      </h2>
                      
                      {/* Extract a short snippet from content */}
                      <p className="text-slate-600 text-[15px] leading-relaxed mb-8 line-clamp-3">
                        {blog.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[*_#>`]/g, '').substring(0, 150).trim()}...
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center space-x-2 text-slate-500 font-semibold text-sm group-hover:text-[#6C63FF] transition-colors">
                        <span>Read More</span> <ArrowRight size={16} />
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>

            {blogs.length === 0 && (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-lg">No published blog posts yet. Check back soon!</p>
              </div>
            )}

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
