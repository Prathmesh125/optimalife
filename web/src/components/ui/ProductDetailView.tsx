"use client";

import { useState } from "react";
import { ArrowLeft, Home, Package, Check, Droplets, Info, X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { submitBrochureRequest } from "@/app/actions/brochureActions";

// Reusable icons for species mapping
const SpeciesIcon = ({ name }: { name: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#7B73C7] shadow-sm border border-slate-100 transition-transform hover:scale-105 hover:bg-[#F2F1FA]">
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* A generic bird/poultry icon for now */}
          <path d="M12 2C9.5 2 7 4 7 8C7 11 9.5 13 12 13C14.5 13 17 11 17 8C17 4 14.5 2 12 2ZM12 14C8 14 3 16 3 20V22H21V20C21 16 16 14 12 14Z" />
        </svg>
      </div>
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{name}</span>
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
      {/* ================= HERO SECTION (CLEAN & ABSTRACT) ================= */}
      <section className="relative w-full h-[35vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Optima Life Sciences Products"
            className="w-full h-full object-cover"
          />
          {/* Deep overlay so the breadcrumbs pop clearly */}
          <div className="absolute inset-0 bg-[#2b2753]/90 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 -mt-8 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-white/90 text-sm font-semibold uppercase tracking-widest drop-shadow-md">
            <Link href="/" className="hover:text-white transition-colors flex items-center"><Home size={14} className="mr-1"/> Home</Link>
            <span className="opacity-50">›</span>
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            {categoryName && (
              <>
                <span className="opacity-50">›</span>
                <span className="text-white/80">{categoryName}</span>
              </>
            )}
          </div>
        </div>
        {/* Soft fade at the bottom into the page background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F9FAFC] to-transparent"></div>
      </section>

      {/* ================= UNIFIED PRODUCT CANVAS ================= */}
      <article className="max-w-6xl mx-auto px-6 lg:px-12 -mt-32 relative z-20 pb-24 font-sans">
        
        {/* The Massive White Canvas */}
        <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgb(0,0,0,0.08)] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Product Image (Clean, No borders) */}
            <div className="lg:w-5/12 flex-shrink-0 bg-white p-12 lg:p-16 flex items-center justify-center relative">
               {/* Subtle background flair */}
               <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white pointer-events-none"></div>
               
              {featuredImage ? (
                <img 
                  src={featuredImage} 
                  alt={product.title}
                  className="w-full h-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 relative z-10"
                />
              ) : (
                <Package size={100} className="text-slate-200 relative z-10" />
              )}
            </div>

            {/* Right: Product Info */}
            <div className="lg:w-7/12 flex flex-col justify-start p-10 lg:p-16 bg-white lg:border-l lg:border-slate-50">
              
              {/* Category Pill */}
              <div className="flex items-center mb-6">
                {subCategoryName ? (
                  <span className="bg-[#F2F1FA] text-[#5B519C] text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                    {subCategoryName}
                  </span>
                ) : (
                  <span className="bg-[#F2F1FA] text-[#5B519C] text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                    {categoryName}
                  </span>
                )}
              </div>
              
              {/* Massive Clean Title */}
              <h2 className="text-4xl lg:text-5xl font-black text-[#2b2753] mb-6 tracking-tight leading-[1.1]">
                {product.title}
              </h2>
              
              {/* Description */}
              <div className="text-slate-500 leading-relaxed text-[16px] mb-10 font-medium">
                {product.shortDescription ? (
                  <p>{product.shortDescription}</p>
                ) : (
                  <ReactMarkdown>{cleanContent.substring(0, 400) + "..."}</ReactMarkdown>
                )}
              </div>
              
              {/* Configurable Attributes (Packs & Species) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
                {/* Available Packs */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Available Packs</h4>
                  <div className="flex flex-wrap gap-2">
                    {availablePacks.map((pack: string) => (
                      <span key={pack} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                        {pack}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Species */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Target Species</h4>
                  <div className="flex gap-4">
                    {targetSpecies.map((species: string) => (
                      <SpeciesIcon key={species} name={species} />
                    ))}
                  </div>
                </div>
                
              </div>

              {/* Request Brochure Button */}
              <div className="mb-14">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#6C63FF] hover:bg-[#5B519C] text-white px-10 py-4 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all shadow-[0_8px_25px_rgb(108,99,255,0.35)] hover:shadow-[0_12px_35px_rgba(108,99,255,0.45)] hover:-translate-y-1"
                >
                  Request Brochure
                </button>
              </div>

              {/* Modern Underline Tabs */}
              <div className="border-b border-slate-200 flex space-x-8 mb-8">
                <button 
                  onClick={() => setActiveTab("features")}
                  className={`pb-4 flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "features" ? "text-[#5B519C]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Check size={16} /> <span>Features & Benefits</span>
                  {activeTab === "features" && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#5B519C]"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveTab("dosage")}
                  className={`pb-4 flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "dosage" ? "text-[#5B519C]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Droplets size={16} /> <span>Dosage</span>
                  {activeTab === "dosage" && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#5B519C]"></div>
                  )}
                </button>
              </div>
              
              <div className="prose-custom prose-slate max-w-none text-slate-500 font-medium leading-relaxed">
                {activeTab === "features" ? (
                  features ? (
                    <ReactMarkdown>{features}</ReactMarkdown>
                  ) : (
                    <ul className="list-none space-y-3">
                      <li className="flex items-start"><span className="text-[#6C63FF] mr-3 mt-1">✓</span> Multiple action - descaling, algaecide, lime & biofilm removal</li>
                      <li className="flex items-start"><span className="text-[#6C63FF] mr-3 mt-1">✓</span> Descaling increases the life of pipeline.</li>
                      <li className="flex items-start"><span className="text-[#6C63FF] mr-3 mt-1">✓</span> Removal of biofilm reduces the load of pathogenic bacteria.</li>
                      <li className="flex items-start"><span className="text-[#6C63FF] mr-3 mt-1">✓</span> Safe for use in presence of birds</li>
                      <li className="flex items-start"><span className="text-[#6C63FF] mr-3 mt-1">✓</span> No chocking, clogging, or cracking of nipples.</li>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2b2753]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h3 className="text-2xl font-black text-[#2b2753]">Request Brochure</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-[#6C63FF] transition-colors bg-slate-50 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                    <Check size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-[#2b2753] mb-3">Request Sent!</h4>
                  <p className="text-slate-500 font-medium">We will email you the brochure shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBrochureSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="First Name" 
                        className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all text-slate-700 font-medium placeholder:text-slate-400"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="Last Name" 
                        className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all text-slate-700 font-medium placeholder:text-slate-400"
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
                      className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all text-slate-700 font-medium placeholder:text-slate-400"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#6C63FF] hover:bg-[#5B519C] text-white px-8 py-4 rounded-xl font-bold text-[13px] tracking-widest uppercase transition-all shadow-[0_8px_25px_rgb(108,99,255,0.25)] hover:shadow-[0_12px_35px_rgba(108,99,255,0.35)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting Request..." : "Send Brochure"}
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
