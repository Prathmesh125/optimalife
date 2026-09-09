import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Package, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanMarkdown } from "@/lib/utils/cleanMarkdown";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const doc = await adminDb.collection("products").doc(slug).get();
  return doc.exists ? { id: doc.id, ...doc.data() } as any : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return { title: "Product Not Found" };
  
  return {
    title: `${product.title} | Optima Life Sciences`,
    description: product.content.substring(0, 160).replace(/[*_#]/g, ''),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const cleanContent = cleanMarkdown(product.content);
  
  // Filter out the logos (Group-89, Group-of-12-Objects, OPTIMA-LOGO) to find the REAL featured image
  const realImages = (product.images || []).filter((img: any) => {
    const name = img?.filename?.toLowerCase() || '';
    return !name.includes('group-89') && 
           !name.includes('group-of-12-objects') && 
           !name.includes('optima-logo');
  });

  const featuredImage = realImages.length > 0 ? realImages[0].url : null;
  const heroImage = "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";

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
    p: ({ node, ...props }: any) => <p className="mb-3 text-slate-600 leading-relaxed text-[17px]" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-600 text-[17px]" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-[#3a356a]" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold text-[#3a356a] mt-8 mb-4" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold text-[#3a356a] mt-6 mb-3" {...props} />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Optima Life Sciences Products"
              className="w-full h-full object-cover"
            />
            {/* Elegant dark purple gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a356a]/70 to-[#3a356a]/30"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold uppercase tracking-widest mb-6 drop-shadow-md">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl mb-6 max-w-4xl leading-tight">
              {product.title}
            </h1>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </section>

        {/* ================= PRODUCT DETAILS ================= */}
        <article className="max-w-5xl mx-auto px-6 lg:px-12 -mt-16 relative z-20 pb-24">
          
          <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-12 lg:gap-20">
            
            {/* Product Image */}
            <div className="md:w-5/12 flex-shrink-0">
              <div className="sticky top-32 relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.08)] bg-slate-50 flex items-center justify-center p-6 border border-slate-100">
                {featuredImage ? (
                  <img 
                    src={featuredImage} 
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package size={80} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-7/12 flex flex-col justify-start">
              
              <Link href="/products" className="inline-flex items-center space-x-2 text-slate-400 hover:text-[#6C63FF] font-medium mb-8 transition-colors">
                <ArrowLeft size={16} />
                <span>Back to all products</span>
              </Link>

              <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold tracking-widest mb-6 w-fit border border-emerald-100">
                PRODUCT SPECIFICATIONS
              </span>
              
              <h2 className="text-3xl font-extrabold text-[#3a356a] mb-6 uppercase tracking-wide">
                {product.title}
              </h2>
              
              <div className="w-full h-[1px] bg-slate-100 mb-8"></div>
              
              <div className="prose-custom max-w-none">
                <ReactMarkdown components={TableComponents}>
                  {cleanContent}
                </ReactMarkdown>
              </div>

            </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
