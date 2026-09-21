import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type AuditAction = "LOGIN" | "BLOG_CREATED" | "CAREER_CREATED" | "INQUIRY_DELETED" | "PRODUCT_CREATED" | "PRODUCT_UPDATED" | "PRODUCT_DELETED" | "CATEGORY_CREATED" | "CATEGORY_UPDATED" | "CATEGORY_DELETED";

export async function logAdminAction(action: AuditAction, userEmail: string, details: string) {
  try {
    await addDoc(collection(db, "audit_logs"), {
      action,
      userEmail,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
