import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Package, Home, Shield, Beaker, Zap, Settings, ArrowDown } from "lucide-react";
import type { Metadata } from "next";
import { cleanMarkdown } from "@/lib/utils/cleanMarkdown";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Optima Life Sciences",
  description: "Explore our range of innovative feed additives, bio-security products, and dosing systems.",
};

const CATEGORIES = [
  { id: "feed-additives", name: "Feed Additives", icon: Package, image: "/images/feed-icon.png" },
  { id: "bio-security", name: "Bio Security", icon: Shield, image: "/images/bio-icon.png" },
  { id: "dosing-system", name: "Dosing System", icon: Settings, image: "/images/dosing-icon.png" },
  { id: "optiserve", name: "Optiserve", icon: Zap, image: "/images/opti-icon.png" },
];

const SUB_CATEGORIES = [
  { id: "cost-effective", name: "COST EFFECTIVE PERFORMANCE SOLUTIONS", category: "feed-additives" },
  { id: "gut-health", name: "GUT HEALTH SOLUTIONS", category: "feed-additives" },
  { id: "enzyme", name: "ENZYME SOLUTIONS", category: "feed-additives" },
  { id: "feed-quality", name: "FEED QUALITY AND MILLING SOLUTIONS", category: "feed-additives" },
  { id: "mineral", name: "MINERAL SOLUTIONS", category: "feed-additives" },
];

async function getProducts() {
  const snapshot = await adminDb.collection("products").get();
  // Filter out the category pages themselves which were scraped as 'products'
  const invalidSlugs = ["products_main", "products_bio-security-2", "products_dosing-system-2"];
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(p => !invalidSlugs.includes(p.id) && !p.id.startsWith('products_feed-additives')); 
}

export default async function ProductsIndexPage() {
  const products = await getProducts();
  
  const pageDoc = await adminDb.collection("pages").doc("products").get();
  const pageData = pageDoc.exists ? pageDoc.data() : null;
  const heroImage = (pageData?.images && pageData.images.length > 0) 
    ? pageData.images[0].url 
    : "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFC] font-sans">
      <Navbar />

      <main className="flex-grow">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[45vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Optima Life Sciences Products"
              className="w-full h-full object-cover"
            />
            {/* Soft purple overlay exactly like screenshot */}
            <div className="absolute inset-0 bg-[#7B73C7]/80 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-6">
              {pageData?.title || "Explore Optima Life's Product Range"}
            </h1>
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base font-semibold tracking-wider">
              <Link href="/" className="flex items-center space-x-1 hover:text-white transition-colors">
                <Home size={16} />
                <span>Home</span>
              </Link>
              <span>›</span>
              <span>Products</span>
            </div>
          </div>

          {/* Wavy bottom divider - SVG approximation for smooth curve */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
             <svg className="relative block w-full h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.63,104,84.4,153.8,70.52,209.5,55.07,264,65.3,321.39,56.44Z" fill="#F9FAFC"></path>
            </svg>
          </div>
        </section>

        {/* ================= CATEGORY NAV ================= */}
        <section className="relative z-20 -mt-24 mb-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {CATEGORIES.map(cat => (
                <a href={`#${cat.id}`} key={cat.id} className="bg-white rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-6 flex flex-col items-center justify-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group">
                  <div className="h-20 w-20 mb-4 flex items-center justify-center text-[#7B73C7] group-hover:scale-110 transition-transform">
                     {/* Fallback to icons if images don't exist */}
                     <cat.icon size={48} />
                  </div>
                  <h3 className="text-[13px] font-bold text-[#3a356a] uppercase tracking-wide text-center">
                    {cat.name}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CATEGORY SECTIONS ================= */}
        {CATEGORIES.map((category) => (
          <section id={category.id} key={category.id} className="py-16 md:py-24 relative border-t border-slate-200/60 first:border-0">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
              
              {/* Category Header */}
              <div className="max-w-3xl mb-12">
                <h2 className="text-3xl font-extrabold text-[#3a356a] mb-4">
                  {category.name}
                </h2>
                {category.id === "feed-additives" && (
                  <p className="text-slate-600 leading-relaxed">
                    Our feed additives take complete care of the nutritional quality of a feed; these depend on a number of factors that include feed presentation, microbial contamination, anti-nutritional factors, digestibility, palatability and intestinal healthfulness. We know that great ingredients are not enough, we are passionate about developing formulations that will keep your animals and birds in optimum shape.
                  </p>
                )}
              </div>

              {/* Subcategories Pills (Only for Feed Additives based on reference) */}
              {category.id === "feed-additives" && (
                <div className="flex flex-wrap gap-3 mb-16">
                  {SUB_CATEGORIES.filter(s => s.category === category.id).map(sub => (
                    <a 
                      href={`#${sub.id}`} 
                      key={sub.id}
                      className="px-6 py-4 bg-[#A39ED6] hover:bg-[#7B73C7] text-white text-[12px] font-bold uppercase tracking-wider rounded-md transition-colors text-center flex-grow sm:flex-grow-0"
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Products Grid for this category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products
                  // If category field is missing from Firebase, just show all for now or try to guess.
                  // For a real CMS, the products would have a 'category' field. We will show all products here that belong to it.
                  // Since we are mocking the structure to fit existing unstructured data:
                  .filter(p => p.category === category.id || (!p.category && category.id === "feed-additives")) 
                  .map((product) => {
                    
                    const cleanedContent = cleanMarkdown(product.content || '');
                    const excerpt = cleanedContent
                      .replace(/[*_#]/g, '')
                      .replace(/\[.*?\]\(.*?\)/g, '')
                      .replace(/\s+/g, ' ')
                      .substring(0, 120);

                    const realImages = (product.images || []).filter((img: any) => {
                      const name = img?.filename?.toLowerCase() || '';
                      return !name.includes('group-89') && 
                             !name.includes('group-of-12-objects') && 
                             !name.includes('optima-logo');
                    });

                    return (
                      <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                        <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center p-8">
                          {realImages.length > 0 ? (
                            <img 
                              src={realImages[0].url} 
                              alt={product.title} 
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package size={64} className="text-slate-200" />
                          )}
                        </div>
                        
                        <div className="p-8 flex flex-col flex-grow bg-slate-50 border-t border-slate-100">
                          {product.subCategory && (
                             <span className="text-xs font-bold text-[#7B73C7] uppercase tracking-wider mb-2 block">
                               {product.subCategory.replace(/-/g, ' ')}
                             </span>
                          )}
                          <h3 className="text-xl font-extrabold text-[#3a356a] mb-3 group-hover:text-[#7B73C7] transition-colors leading-tight">
                            {product.title}
                          </h3>
                          
                          <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                            {excerpt}...
                          </p>
                          
                          <div className="mt-auto flex items-center space-x-2 text-[#7B73C7] font-bold text-sm">
                            <span>View Details</span>
                            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    );
                })}
              </div>
              
              {/* Fallback empty state if no products matched this category */}
              {products.filter(p => p.category === category.id || (!p.category && category.id === "feed-additives")).length === 0 && (
                 <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                   <p className="text-slate-500 font-medium">Products for this category will appear here once added in the Admin panel.</p>
                 </div>
              )}

            </div>
          </section>
        ))}

      </main>

      <Footer />
    </div>
  );
}
