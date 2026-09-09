import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Package, Home } from "lucide-react";
import type { Metadata } from "next";
import { cleanMarkdown } from "@/lib/utils/cleanMarkdown";

export const metadata: Metadata = {
  title: "Products | Optima Life Sciences",
  description: "Explore our range of innovative feed additives, bio-security products, and dosing systems.",
};

async function getProducts() {
  const snapshot = await adminDb.collection("products").get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(p => p.id !== "products_main"); // Skip the main text if it's just introductory
}

export default async function ProductsIndexPage() {
  const products = await getProducts();
  const heroImage = "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md mb-6">
              Our Products
            </h1>
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base font-medium drop-shadow-sm mb-6">
              <Link href="/" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                <Home size={16} />
                <span>Home</span>
              </Link>
              <span>›</span>
              <span>Our Products</span>
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium drop-shadow-sm">
              Discover our comprehensive range of feed additives, gut health solutions, and bio-security products designed for optimum animal performance.
            </p>
          </div>

          {/* Wavy bottom divider / clean white gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </section>

        {/* ================= PRODUCTS GRID ================= */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product) => {
                
                // Clean the markdown to remove scraped headers and menus
                const cleanedContent = cleanMarkdown(product.content || '');
                // Grab a clean excerpt
                const excerpt = cleanedContent
                  .replace(/[*_#]/g, '')
                  .replace(/\[.*?\]\(.*?\)/g, '')
                  .replace(/\s+/g, ' ')
                  .substring(0, 140);

                // Filter out logos if they got scraped
                const realImages = (product.images || []).filter((img: any) => {
                  const name = img?.filename?.toLowerCase() || '';
                  return !name.includes('group-89') && 
                         !name.includes('group-of-12-objects') && 
                         !name.includes('optima-logo');
                });

                return (
                  <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300">
                    
                    <div className="relative h-56 overflow-hidden bg-slate-50 flex items-center justify-center p-6">
                      {realImages.length > 0 ? (
                        <img 
                          src={realImages[0].url} 
                          alt={product.title} 
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-lg"
                        />
                      ) : (
                        <Package size={48} className="text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-[#3a356a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow relative border-t border-slate-50">
                      <h2 className="text-xl font-extrabold text-[#3a356a] mb-4 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight uppercase tracking-wide">
                        {product.title}
                      </h2>
                      
                      <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3 mb-8 flex-grow">
                        {excerpt}...
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center space-x-2 text-slate-500 font-semibold text-sm group-hover:text-[#6C63FF] transition-colors">
                        <span>View Product</span>
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
