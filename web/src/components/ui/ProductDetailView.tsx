"use client";

import { useState } from "react";
import { ArrowLeft, Home, Package, Check, Droplets, Info, X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { submitBrochureRequest } from "@/app/actions/brochureActions";

// Reusable icons for species mapping
const SpeciesIcon = ({ name }: { name: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-14 h-14 rounded-full bg-[#E8E6F5] flex items-center justify-center text-[#7B73C7] shadow-inner border border-white">
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* A generic bird/poultry icon for now */}
          <path d="M12 2C9.5 2 7 4 7 8C7 11 9.5 13 12 13C14.5 13 17 11 17 8C17 4 14.5 2 12 2ZM12 14C8 14 3 16 3 20V22H21V20C21 16 16 14 12 14Z" />
        </svg>
      </div>
      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{name}</span>
    </div>
  );
};

export default function ProductDetailView({ product, cleanContent, featuredImage, heroImage }: any) {
  const [activeTab, setActiveTab] = useState<"features" | "dosage">("features");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fallbacks and type safety if structured data doesn't exist or is legacy string
  const categoryName = product.category ? product.category.replace(/-/g, ' ') : "Bio Security";
  const subCategoryName = product.subCategory ? product.subCategory.replace(/-/g, ' ') : null;
  
  const targetSpecies = Array.isArray(product.targetSpecies) 
    ? product.targetSpecies 
    : (typeof product.targetSpecies === 'string' ? product.targetSpecies.split(',').map((s: string) => s.trim()) : ["Broilers", "Layers", "Breeders"]);
    
  const availablePacks = Array.isArray(product.availablePacks)
    ? product.availablePacks
    : (typeof product.availablePacks === 'string' ? product.availablePacks.split(',').map((s: string) => s.trim()) : ["5L"]);
    
  const features = product.features || null;
  const dosage = product.dosage || null;

  const handleBrochureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitBrochureRequest({
        ...formData,
        productName: product.title,
        productId: product.id
      });
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData({ firstName: '', lastName: '', email: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Optima Life Sciences Products"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#3a356a]/80 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg mb-4">
            {subCategoryName ? `${subCategoryName}: ` : ''}{product.title}
          </h1>
          
          <div className="flex items-center space-x-2 text-white/80 text-sm font-semibold uppercase tracking-widest drop-shadow-md">
            <Link href="/" className="hover:text-white transition-colors flex items-center"><Home size={14} className="mr-1"/> Home</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <span>›</span>
            <span className="text-white">{product.title}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F9FAFC] to-transparent"></div>
      </section>

      {/* ================= PRODUCT DETAILS ================= */}
      <article className="max-w-6xl mx-auto px-6 lg:px-12 -mt-16 relative z-20 pb-24 font-sans">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left: Product Image */}
          <div className="lg:w-5/12 flex-shrink-0">
            <div className="sticky top-32 w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex items-center justify-center min-h-[400px]">
              {featuredImage ? (
                <img 
                  src={featuredImage} 
                  alt={product.title}
                  className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <Package size={100} className="text-slate-200" />
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-7/12 flex flex-col justify-start pt-4">
            
            <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Category - {categoryName}</p>
            <h2 className="text-4xl font-black text-[#3a356a] mb-6 tracking-tight leading-none">
              {product.title}
            </h2>
            
            {/* Description (Fallback to extracted excerpt if not explicitly structured) */}
            <div className="text-slate-600 leading-relaxed text-[15px] mb-8">
              {product.shortDescription ? (
                <p>{product.shortDescription}</p>
              ) : (
                <ReactMarkdown>{cleanContent.substring(0, 400) + "..."}</ReactMarkdown>
              )}
            </div>
            
            {/* Available Packs */}
            <div className="mb-8 border-b border-slate-100 pb-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Available Pack</h4>
              <div className="flex flex-wrap gap-3">
                {availablePacks.map((pack: string) => (
                  <span key={pack} className="px-6 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-sm shadow-sm">
                    {pack}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Species */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Target Species</h4>
              <div className="flex gap-6">
                {targetSpecies.map((species: string) => (
                  <SpeciesIcon key={species} name={species} />
                ))}
              </div>
            </div>

            {/* Request Brochure Button */}
            <div className="mb-12">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#5B519C] hover:bg-[#4a4282] text-white px-8 py-3.5 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all shadow-[0_4px_14px_0_rgb(91,81,156,0.39)] hover:shadow-[0_6px_20px_rgba(91,81,156,0.23)] hover:-translate-y-0.5"
              >
                REQUEST BROCHURE
              </button>
            </div>

            {/* Tabs for Features & Dosage */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button 
                  onClick={() => setActiveTab("features")}
                  className={`flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "features" ? "bg-[#5B519C] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                >
                  <Check size={16} /> <span>Features & Benefits</span>
                </button>
                <button 
                  onClick={() => setActiveTab("dosage")}
                  className={`flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "dosage" ? "bg-[#5B519C] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                >
                  <Droplets size={16} /> <span>Dosage</span>
                </button>
              </div>
              
              <div className="p-8 prose-custom prose-sm max-w-none text-slate-600">
                {activeTab === "features" ? (
                  features ? (
                    <ReactMarkdown>{features}</ReactMarkdown>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Multiple action - descaling, algaecide, lime removal & biofilm removal</li>
                      <li>Descaling increases the life of pipeline.</li>
                      <li>Removal of biofilm reduces the load of pathogenic bacteria.</li>
                      <li>Safe for use in presence of birds</li>
                      <li>No chocking, clogging, or cracking of nipples.</li>
                    </ul>
                  )
                ) : (
                  dosage ? (
                    <ReactMarkdown>{dosage}</ReactMarkdown>
                  ) : (
                    <p>Please contact us for specific dosage recommendations tailored to your flock and environmental conditions.</p>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      </article>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3a356a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-[#3a356a]">Request Brochure</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Request Sent!</h4>
                  <p className="text-slate-500">We will email you the brochure shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBrochureSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="First Name" 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B73C7] focus:border-transparent transition-all"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="Last Name" 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B73C7] focus:border-transparent transition-all"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B73C7] focus:border-transparent transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-auto bg-[#7B73C7] hover:bg-[#5B519C] text-white px-8 py-3 rounded-md font-bold text-[13px] tracking-widest uppercase transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
