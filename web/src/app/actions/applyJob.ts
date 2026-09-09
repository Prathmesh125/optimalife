"use server";

import { adminDb } from "@/lib/firebase/admin";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function submitApplication(formData: FormData) {
  try {
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const resumeFile = formData.get("resume") as File | null;
    
    // Extract any dynamic fields
    const dynamicData: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string" && !["jobId", "name", "email", "phone", "resume"].includes(key)) {
        dynamicData[key] = value;
      }
    });

    if (!jobId || !name || !email) {
      throw new Error("Missing required fields");
    }

    // 1. Upload Resume to Cloudflare R2
    const r2 = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_S3_API!,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      },
    });

    let resumeUrl = null;
    if (resumeFile && resumeFile.size > 0) {
      const fileBuffer = await resumeFile.arrayBuffer();
      const objectKey = `resumes/${Date.now()}_${resumeFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      await r2.send(new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_ID!,
        Key: objectKey,
        Body: Buffer.from(fileBuffer),
        ContentType: resumeFile.type || "application/pdf",
      }));

      resumeUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}/${objectKey}`;
    }

    // 2. Save Application to Firestore
    const appRef = adminDb.collection("applications").doc();
    await appRef.set({
      jobId,
      applicantName: name,
      applicantEmail: email,
      applicantPhone: phone || "",
      resumeUrl,
      dynamicData,
      submittedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return { success: false, error: error.message };
  }
}
