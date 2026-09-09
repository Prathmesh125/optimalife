import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, sessionId } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; 

    const docRef = adminDb.collection("website_traffic").doc(dateStr);

    // Use a transaction to reliably update or create
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        transaction.set(docRef, {
          date: dateStr,
          views: 1,
          sessions: [sessionId],
          visitors: 1,
        });
      } else {
        const data = doc.data()!;
        const sessions: string[] = data.sessions || [];
        const isNewSession = !sessions.includes(sessionId);
        
        transaction.update(docRef, {
          views: FieldValue.increment(1),
          ...(isNewSession && { 
            sessions: FieldValue.arrayUnion(sessionId),
            visitors: FieldValue.increment(1) 
          })
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
