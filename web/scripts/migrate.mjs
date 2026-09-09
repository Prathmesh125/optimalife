import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Setup Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../optimalife-83bce-firebase-adminsdk-fbsvc-7bfe119ad5.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// Setup Cloudflare R2
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_S3_API,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_ID;
const PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL;

const baseDir = path.join(__dirname, '../../');

// Mapping of directories to Firestore collections
const DIR_TYPES = {
  pages: ['home', 'about-us', 'optiserve', 'careers', 'blogs', 'contact-us'],
  products: ['products_main', 'products_bio-security-2', 'products_dosing-system-2', 'products_feed-additives_cost-effective', 'products_feed-additives_enzyme', 'products_feed-additives_feed-quality', 'products_feed-additives_gut-health', 'products_feed-additives_mineral'],
  blog_posts: ['blog_14_years', 'blog_care_center', 'blog_cure_medicines', 'blog_dubai_symposium', 'blog_new_plant', 'blog_optivision_leadership', 'blog_optivision_sales', 'blog_probiotic', 'blog_reviving_earth', 'blog_vietnam_offsite']
};

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function uploadImageToR2(filePath, objectKey) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);
    
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: fileContent,
      ContentType: contentType,
    }));
    
    return `${PUBLIC_URL}/${objectKey}`;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

async function processDirectory(dirName, collectionType) {
  console.log(`\n--- Processing ${dirName} as ${collectionType} ---`);
  const fullPath = path.join(baseDir, dirName);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Directory ${dirName} not found.`);
    return;
  }

  const contentPath = path.join(fullPath, 'content.md');
  let content = '';
  if (fs.existsSync(contentPath)) {
    content = fs.readFileSync(contentPath, 'utf8');
  }

  const imagesPath = path.join(fullPath, 'images');
  let images = [];
  
  if (fs.existsSync(imagesPath)) {
    const files = fs.readdirSync(imagesPath);
    for (const file of files) {
      if (file.startsWith('.')) continue; // skip hidden
      const filePath = path.join(imagesPath, file);
      const objectKey = `${dirName}/${file}`;
      
      console.log(`Uploading ${objectKey}...`);
      const publicUrl = await uploadImageToR2(filePath, objectKey);
      
      if (publicUrl) {
        images.push({ filename: file, url: publicUrl });
        // Replace local references in markdown with public URL
        // e.g., if content has ![alt](file), replace it if possible.
        // The markdown might not have the exact filename, but we can try.
      }
    }
  }

  // Determine a simple title
  const title = dirName.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();

  // Save to Firestore
  const docRef = db.collection(collectionType).doc(dirName);
  await docRef.set({
    title,
    slug: dirName,
    content,
    images,
    updatedAt: new Date().toISOString()
  });
  
  console.log(`✅ Saved ${dirName} to Firestore ${collectionType}`);
}

async function migrate() {
  for (const [collectionType, dirs] of Object.entries(DIR_TYPES)) {
    for (const dirName of dirs) {
      await processDirectory(dirName, collectionType);
    }
  }
  console.log('\n🎉 Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
