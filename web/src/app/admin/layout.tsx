"use client";

import { useAuth, AuthProvider } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, Home, FileText, Briefcase, FileImage, MessageSquare } from "lucide-react";
import { auth } from "@/lib/firebase/client";

function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Pages", href: "/admin/pages", icon: FileText },
    { name: "Blogs", href: "/admin/blogs", icon: FileImage },
    { name: "Careers", href: "/admin/careers", icon: Briefcase },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col shadow-sm relative z-10 border-r border-slate-200">
      <div className="p-6 border-b border-slate-100 mb-4">
        <Link href="/admin" className="flex items-center space-x-3">
          <img src="/icon.png" alt="Optima Logo" className="w-10 h-10 object-contain rounded-md" />
          <span className="text-[#3a356a] font-extrabold text-xl tracking-tight">Optima Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 px-3">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? "bg-[#6C63FF] text-white shadow-[0_4px_15px_rgba(108,99,255,0.3)]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#6C63FF]"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100 mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-bold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user && pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {pathname !== "/admin/login" && <AdminSidebar />}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6C63FF]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
