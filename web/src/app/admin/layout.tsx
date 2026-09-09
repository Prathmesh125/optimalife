"use client";

import { useAuth, AuthProvider } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, Home, FileText, Briefcase, FileImage } from "lucide-react";
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
  ];

  return (
    <div className="w-64 bg-[#2b2752] text-slate-300 min-h-screen flex flex-col shadow-2xl relative z-10 border-r border-[#1e1b3a]">
      <div className="p-6 border-b border-white/5 mb-4">
        <div className="text-white font-black text-2xl tracking-tight flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">O</span>
          </div>
          <span>Optima Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 mt-2 px-3">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-[#6C63FF] text-white shadow-[0_4px_20px_rgba(108,99,255,0.4)] font-medium" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-white/50"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-3 py-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors font-medium"
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
