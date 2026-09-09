import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { Calendar, User, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanMarkdown } from "@/lib/utils/cleanMarkdown";

export const dynamic = "force-dynamic";

async function getBlog(slug: string) {
  const doc = await adminDb.collection("blog_posts").doc(slug).get();
  return doc.exists ? { id: doc.id, ...doc.data() } as any : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);
  if (!blog) return { title: "Blog Not Found" };
  
  return {
    title: `${blog.title} | Optima Life Sciences`,
    description: blog.content.substring(0, 160).replace(/[*_#]/g, ''),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  // Filter out the logos (Group-89, Group-of-12-Objects, OPTIMA-LOGO) to find the REAL featured image
  const realImages = (blog.images || []).filter((img: any) => {
    const name = img?.filename?.toLowerCase() || '';
    return !name.includes('group-89') && 
           !name.includes('group-of-12-objects') && 
           !name.includes('optima-logo');
  });

  const featuredImage = realImages.length > 0 
    ? realImages[0].url 
    : "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1974&auto=format&fit=crop";

  const cleanedContent = cleanMarkdown(blog.content);

  // Schema Markup for SEO/GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": featuredImage,
    "datePublished": blog.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "Optima Life Sciences"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Optima Life Sciences",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.optimalife.in/wp-content/uploads/2023/09/Group-of-12-Objects.png"
      }
    }
  };

  // Custom Markdown Components for premium rendering
  const MarkdownComponents = {
    h2: ({ node, ...props }: any) => <h2 className="text-3xl font-bold text-[#3a356a] mt-12 mb-6" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-2xl font-bold text-[#3a356a] mt-8 mb-4" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-lg text-slate-700 leading-loose mb-6" {...props} />,
    a: ({ node, ...props }: any) => <a className="text-[#6C63FF] font-semibold hover:underline" {...props} />,
    img: ({ node, ...props }: any) => (
      <span className="block my-10 rounded-2xl overflow-hidden shadow-md">
        <img {...props} className="w-full h-auto object-cover" />
      </span>
    ),
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-slate-700" {...props} />,
    li: ({ node, ...props }: any) => <li className="" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-[#3a356a]" {...props} />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pb-24">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={featuredImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]/30"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-32 text-center flex flex-col items-center">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold uppercase tracking-widest mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl mb-8">
              {blog.title}
            </h1>

            <div className="flex items-center justify-center space-x-8 text-white/90 font-medium">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Calendar size={18} />
                <span>{new Date(blog.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <User size={18} />
                <span>Optima Editorial Team</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ARTICLE CONTENT ================= */}
        <article className="max-w-4xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">
          
          <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-xl border border-slate-100">
            <Link href="/blogs" className="inline-flex items-center space-x-2 text-slate-500 hover:text-[#6C63FF] font-medium mb-10 transition-colors">
              <ArrowLeft size={16} />
              <span>Back to all blogs</span>
            </Link>

            <div className="prose-custom max-w-none">
              {(blog.blocks && blog.blocks.length > 0) ? (
                <div className="space-y-8">
                  {blog.blocks.map((block: any, idx: number) => {
                    if (block.type === 'heading') {
                      return <h2 key={block.id} className="text-3xl font-bold text-[#3a356a] mt-12 mb-6">{block.content}</h2>;
                    }
                    if (block.type === 'image') {
                      return (
                        <div key={block.id} className="my-10 rounded-2xl overflow-hidden shadow-md">
                          <img src={block.url} alt={block.caption || 'Blog Image'} className="w-full h-auto object-cover" />
                          {block.caption && <p className="text-center text-sm text-slate-500 mt-3 italic">{block.caption}</p>}
                        </div>
                      );
                    }
                    if (block.type === 'text') {
                      return (
                        <ReactMarkdown key={block.id} components={MarkdownComponents}>
                          {block.content}
                        </ReactMarkdown>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <ReactMarkdown components={MarkdownComponents}>
                  {cleanedContent}
                </ReactMarkdown>
              )}
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
