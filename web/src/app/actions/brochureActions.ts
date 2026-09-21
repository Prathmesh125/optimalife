"use server";

import { adminDb } from "@/lib/firebase/admin";

export async function submitBrochureRequest(data: {
  firstName: string;
  lastName: string;
  email: string;
  productName: string;
  productId: string;
}) {
  try {
    await adminDb.collection("brochure_requests").add({
      ...data,
      createdAt: new Date().toISOString(),
      status: "new",
    });
    
    // Also log this in audit logs
    await adminDb.collection("audit_logs").add({
      action: "New Brochure Request",
      userEmail: data.email,
      timestamp: new Date().toISOString(),
      details: `Requested brochure for ${data.productName}`,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting brochure request:", error);
    throw new Error("Failed to submit brochure request");
  }
}
