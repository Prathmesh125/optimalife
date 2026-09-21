"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Package, Shield, Beaker, Zap, Settings, Search } from "lucide-react";

const CATEGORIES = [
  { 
    id: "feed-additives", 
    name: "Feed Additives", 
    icon: Package,
    description: "Our feed additives take complete care of the nutritional quality of a feed; these depend on a number of factors that include feed presentation, microbial contamination, anti-nutritional factors, digestibility, palatability and intestinal healthfulness. We know that great ingredients are not enough, we are passionate about developing formulations that will keep your animals and birds in optimum shape."
  },
  { 
    id: "bio-security", 
    name: "Bio Security", 
    icon: Shield,
    description: "Our biosecurity products are scientifically designed to protect your facility from harmful pathogens and ensure a safe, healthy environment for livestock."
  },
  { 
    id: "dosing-system", 
    name: "Dosing System", 
    icon: Settings,
    description: "Advanced dosing systems for precise and reliable delivery of treatments and supplements directly into water lines, minimizing waste and maximizing efficiency."
  },
  { 
    id: "optiserve", 
    name: "Optiserve", 
    icon: Zap,
    description: "Comprehensive analytical and consulting services dedicated to optimizing performance and diagnosing critical challenges in your operations."
  },
];

const SUB_CATEGORIES = [
  { id: "cost-effective", name: "COST EFFECTIVE PERFORMANCE SOLUTIONS", category: "feed-additives" },
  { id: "gut-health", name: "GUT HEALTH SOLUTIONS", category: "feed-additives" },
  { id: "enzyme", name: "ENZYME SOLUTIONS", category: "feed-additives" },
  { id: "feed-quality", name: "FEED QUALITY AND MILLING SOLUTIONS", category: "feed-additives" },
  { id: "mineral", name: "MINERAL SOLUTIONS", category: "feed-additives" },
];

export default function ProductShowcase({ products }: { products: any[] }) {
  const [activeCategory, setActiveCategory] = useState("feed-additives");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  // When category changes, reset subcategory
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setActiveSubCategory(null);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const currentSubCategories = SUB_CATEGORIES.filter(s => s.category === activeCategory);

  // Filter products based on selected category and subcategory
  const filteredProducts = products.filter(p => {
    // Basic category match logic (handles legacy missing categories for feed-additives)
    const matchesCategory = p.category === activeCategory || (!p.category && activeCategory === "feed-additives");
    
    if (!matchesCategory) return false;

    // Subcategory match logic
    if (activeSubCategory) {
      // Check if product's subCategory string matches the selected ID (loosely since IDs have hyphens and names have spaces)
      // e.g., activeSubCategory: "cost-effective", product.subCategory might be "cost-effective" or "Cost Effective"
      if (!p.subCategory) return false;
      return p.subCategory.toLowerCase().replace(/[^a-z0-9]/g, '') === activeSubCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    
    return true; // If no subcategory selected, show all in category
  });

  return (
    <div className="flex flex-col">
      {/* ================= CATEGORY NAV ================= */}
      <section className="relative z-20 -mt-24 mb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button 
                  onClick={() => handleCategoryChange(cat.id)}
                  key={cat.id} 
                  className={`rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.08)] p-6 flex flex-col items-center justify-center transition-all duration-300 group
                    ${isActive 
                      ? "bg-[#6C63FF] border-transparent transform -translate-y-2 shadow-[0_20px_40px_rgba(108,99,255,0.25)]" 
                      : "bg-white border-slate-100 border hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]"
                    }`}
                >
                  <div className={`h-20 w-20 mb-4 flex items-center justify-center transition-transform group-hover:scale-110
                    ${isActive ? "text-white" : "text-[#7B73C7]"}
                  `}>
                     <cat.icon size={48} />
                  </div>
                  <h3 className={`text-[13px] font-bold uppercase tracking-wide text-center
                    ${isActive ? "text-white" : "text-[#3a356a]"}
                  `}>
                    {cat.name}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT SECTION ================= */}
      <section className="py-8 md:py-16 relative">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Category Header */}
            <div className="max-w-3xl mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a356a] mb-6">
                {currentCategoryObj?.name}
              </h2>
              {currentCategoryObj?.description && (
                <p className="text-slate-600 text-lg leading-relaxed">
                  {currentCategoryObj.description}
                </p>
              )}
            </div>

            {/* Subcategories Pills */}
            {currentSubCategories.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-16">
                <button
                  onClick={() => setActiveSubCategory(null)}
                  className={`px-6 py-4 text-[12px] font-bold uppercase tracking-wider rounded-md transition-colors text-center flex-grow sm:flex-grow-0
                    ${!activeSubCategory 
                      ? "bg-[#6C63FF] text-white shadow-md" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  ALL PRODUCTS
                </button>

                {currentSubCategories.map(sub => (
                  <button
                    onClick={() => setActiveSubCategory(sub.id)}
                    key={sub.id}
                    className={`px-6 py-4 text-[12px] font-bold uppercase tracking-wider rounded-md transition-colors text-center flex-grow sm:flex-grow-0
                      ${activeSubCategory === sub.id
                        ? "bg-[#6C63FF] text-white shadow-md"
                        : "bg-[#A39ED6]/20 text-[#3a356a] hover:bg-[#A39ED6]/40"
                      }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <motion.div 
                key={`${activeCategory}-${activeSubCategory}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProducts.map((product) => {
                  
                  // Helper function to extract a clean excerpt from markdown string
                  const getExcerpt = (markdownStr: string) => {
                    if (!markdownStr) return "";
                    return markdownStr
                      .replace(/[*_#]/g, '')
                      .replace(/\[.*?\]\(.*?\)/g, '')
                      .replace(/\n+/g, ' ')
                      .replace(/\s+/g, ' ')
                      .substring(0, 120);
                  };

                  const excerpt = getExcerpt(product.content || '');

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
                        ) : product.image ? (
                           <img 
                             src={product.image} 
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
                          {excerpt}{excerpt.length > 0 ? "..." : ""}
                        </p>
                        
                        <div className="mt-auto flex items-center space-x-2 text-[#7B73C7] font-bold text-sm">
                          <span>View Details</span>
                          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50"
              >
                 <Search size={48} className="text-slate-300 mb-4" />
                 <h3 className="text-xl font-bold text-slate-700 mb-2">No products found</h3>
                 <p className="text-slate-500 font-medium max-w-sm">There are currently no products matching this exact filter combination.</p>
                 
                 {activeSubCategory && (
                   <button 
                     onClick={() => setActiveSubCategory(null)}
                     className="mt-6 bg-white border border-slate-200 px-6 py-2 rounded-lg font-bold text-slate-600 hover:text-[#6C63FF] hover:border-[#6C63FF] transition-colors"
                   >
                     View all {currentCategoryObj?.name}
                   </button>
                 )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
