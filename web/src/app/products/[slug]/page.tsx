import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { cleanMarkdown } from "@/lib/utils/cleanMarkdown";
import ProductDetailView from "@/components/ui/ProductDetailView";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const doc = await adminDb.collection("products").doc(slug).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  return { 
    id: doc.id, 
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return { title: "Product Not Found" };
  
  return {
    title: `${product.title} | Optima Life Sciences`,
    description: product.content?.substring(0, 160).replace(/[*_#]/g, '') || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const cleanContent = cleanMarkdown(product.content || '');
  
  // Filter out the logos (Group-89, Group-of-12-Objects, OPTIMA-LOGO) to find the REAL featured image
  const realImages = (product.images || []).filter((img: any) => {
    const name = img?.filename?.toLowerCase() || '';
    return !name.includes('group-89') && 
           !name.includes('group-of-12-objects') && 
           !name.includes('optima-logo');
  });

  const featuredImage = product.image || (realImages.length > 0 ? realImages[0].url : null);
  const heroImage = "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2073&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFC]">
      <Navbar />

      <main className="flex-grow">
        <ProductDetailView 
          product={product} 
          cleanContent={cleanContent} 
          featuredImage={featuredImage} 
          heroImage={heroImage} 
        />
      </main>

      <Footer />
    </div>
  );
}

