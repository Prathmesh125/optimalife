import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
try {
  const serviceAccountPath = resolve(__dirname, '../../optimalife-83bce-firebase-adminsdk-fbsvc-7bfe119ad5.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error.message);
  console.log("Please ensure optimalife-83bce-firebase-adminsdk-fbsvc-7bfe119ad5.json is correctly placed.");
  process.exit(1);
}

const db = getFirestore();

function cleanMarkdown(markdown) {
  if (!markdown) return "";
  let cleaned = markdown;

  // Remove the repetitive WordPress "Menu" blocks that got scraped
  cleaned = cleaned.replace(/Menu\s*(?:\*\s*\[.*?\]\(.*?\)\s*)+/g, "");
  
  // Remove repetitive logo text / image links that appear at the top/bottom
  cleaned = cleaned.replace(/\[\s*!\[.*?logo.*?\]\(.*?\)\s*\]\(.*?\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?logo.*?\]\(.*?\)/gi, "");
  
  // Remove "Our Links" footer block
  cleaned = cleaned.replace(/Our Links\s*(?:\*\s*\[.*?\]\(.*?\)\s*)+/g, "");
  
  // Remove "Connnet with us Send Copyright..." block
  cleaned = cleaned.replace(/Connet with us\s*Send\s*(Copyright.*)?/g, "");
  cleaned = cleaned.replace(/Connnet with us\s*Send/g, "");

  // Remove top breadcrumbs and title
  cleaned = cleaned.replace(/Discover Optima Life's Story and Mission/i, "");
  cleaned = cleaned.replace(/\* \[Home\]\(https:\/\/www\.optimalife\.in\/\)\n\s*\* About us/i, "");
  cleaned = cleaned.replace(/\[optimalife\]\(https?:\/\/(www\.)?optimalife\.in\/?.*?\)/gi, "");
  
  // Also clean pure [optimalife] links even if they have quotes inside the link
  cleaned = cleaned.replace(/\[optimalife\]\(.*?optimalife.*?\)/gi, "");

  // Remove ugly/blurry icon images that got scraped
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Vision-1\.png\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Mission\.png\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Values\.png\)/gi, "");
  
  // Remove broken images that just point to /about-us/
  cleaned = cleaned.replace(/!\[.*?\]\(https?:\/\/(www\.)?optimalife\.in\/about-us\/?\)/gi, "");

  // Remove empty headings or random whitespace
  cleaned = cleaned.replace(/#+\s*$/gm, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

async function processCollection(collectionName) {
  console.log(`\nProcessing collection: ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.content) {
      const cleanedContent = cleanMarkdown(data.content);
      
      // Only update if changes were actually made
      if (cleanedContent !== data.content) {
        await db.collection(collectionName).doc(doc.id).update({
          content: cleanedContent,
          updatedAt: new Date().toISOString()
        });
        console.log(`- Updated document: ${doc.id}`);
        updatedCount++;
      }
    }
  }

  console.log(`Completed ${collectionName}. Documents updated: ${updatedCount}`);
}

async function runCleanup() {
  console.log("Starting Markdown Cleanup across all collections...");
  
  await processCollection("pages");
  await processCollection("blog_posts");
  await processCollection("products");
  
  console.log("\nCleanup Finished Successfully.");
}

runCleanup();
