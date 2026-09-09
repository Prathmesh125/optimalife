import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    // Attempt to parse out the raw Key from a full URL if a URL was accidentally sent
    let keyToDelete = filename;
    if (filename.startsWith('http')) {
       // e.g. https://pub-123.r2.dev/folder/file.png
       keyToDelete = filename.replace(PUBLIC_URL + '/', '');
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: keyToDelete,
      })
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
