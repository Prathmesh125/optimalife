import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_ID;
const R2_API = process.env.CLOUDFLARE_S3_API;
const ACCESS_KEY = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL;

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_API,
  credentials: {
    accessKeyId: ACCESS_KEY!,
    secretAccessKey: SECRET_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const timestamp = Date.now();
    const finalFilename = `${folder}/${timestamp}-${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: finalFilename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `${PUBLIC_URL}/${finalFilename}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: finalFilename 
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
