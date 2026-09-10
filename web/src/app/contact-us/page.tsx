import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ui/ContactForm";

export const revalidate = 0;

export const metadata = {
  title: "Contact Us | Optima Life Sciences",
  description: "Get in touch with Optima Life Sciences for inquiries regarding feed additives and bio-security products.",
};

async function getPageData() {
  const doc = await adminDb.collection("pages").doc("contact-us").get();
  return doc.exists ? { id: doc.id, ...doc.data() } as any : null;
}

export default async function ContactPage() {
  const page = await getPageData();

  if (!page) {
    notFound();
  }

  const sections = page.sections || {};
  const header = sections.header || {};
  const contactInfo = sections.contactInfo || {};

  // For SEO/GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Optima Life Sciences",
      "telephone": contactInfo.phone || "+91-020-24420720",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": contactInfo.address?.split('\n')[0] || "P.NO. 47/2/2, BL 44, LIC Colony, Parvati",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-primary)] font-bold mb-4">
              {header.title || "Get in Touch"}
            </h1>
            <p className="text-lg text-slate-600">
              {header.subtitle || "Have questions about our products or services? Our team of experts is here to help you achieve optimum animal health."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Contact Info */}
            <div className="space-y-10">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Corporate Office</h3>
                  <address className="not-italic text-slate-600 space-y-1">
                    {contactInfo.address ? (
                      contactInfo.address.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                      ))
                    ) : (
                      <>
                        <p>P.NO. 47/2/2, BL 44, LIC Colony,</p>
                        <p>Parvati, Pune – 411009,</p>
                        <p>Maharashtra, India.</p>
                      </>
                    )}
                  </address>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Phone</h3>
                  <p className="text-slate-600">{contactInfo.phone || "020-24420720"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
                  <p className="text-slate-600">{contactInfo.email || "info@optimalife.in"}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
