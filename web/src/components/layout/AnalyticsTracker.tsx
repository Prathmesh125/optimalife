"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate or retrieve a unique session ID for this browser session
    let sessionId = sessionStorage.getItem("optima_sid");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("optima_sid", sessionId);
    }

    // Don't track admin panel visits to keep data clean
    if (pathname && !pathname.startsWith("/admin")) {
      const trackView = async () => {
        try {
          await fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              path: pathname,
              sessionId 
            }),
          });
        } catch (error) {
          console.error("Failed to track analytics:", error);
        }
      };

      // Slight delay to ensure it doesn't block critical rendering
      const timeout = setTimeout(trackView, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  return null; // Invisible component
}
