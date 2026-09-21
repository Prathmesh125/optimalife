import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Home } from "lucide-react";
import type { Metadata } from "next";
import ProductShowcase from "@/components/ui/ProductShowcase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Optima Life Sciences",
  description: "Explore our range of innovative feed additives, bio-security products, and dosing systems.",
};

async function getProducts() {
  const snapshot = await adminDb.collection("products").get();
  // Filter out the category pages themselves which were scraped as 'products'
  const invalidSlugs = ["products_main", "products_bio-security-2", "products_dosing-system-2"];
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(p => !invalidSlugs.includes(p.id) && !p.id.startsWith('products_feed-additives')); 
}

async function getCategories() {
  const snapshot = await adminDb.collection("productCategories").orderBy("order", "asc").get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
}

export default async function ProductsIndexPage() {
  const products = await getProducts();
  const categories = await getCategories();
  
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

        {/* ================= DYNAMIC PRODUCT SHOWCASE ================= */}
        <ProductShowcase products={products} categories={categories} />

      </main>

      <Footer />
    </div>
  );
}
