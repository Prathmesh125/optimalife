import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const serviceAccountPath = resolve(__dirname, '../../optimalife-83bce-firebase-adminsdk-fbsvc-7bfe119ad5.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error.message);
  process.exit(1);
}

const db = getFirestore();

async function runMigration() {
  console.log("Starting Migration to Structured Sections for BLOGS Landing page...");
  
  const docRef = db.collection('pages').doc('blogs');
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error("Blogs page not found in DB. Creating it.");
  }

  const newSections = {
    header: {
      title: "Insightful Blogs from Optima Life"
    }
  };

  // We set the images array at the root level so the Admin Media Manager handles it
  const newImages = [
    {
      filename: "default-hero",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
    }
  ];

  await docRef.set({ 
    title: "BLOGS",
    slug: "blogs",
    sections: newSections,
    images: newImages 
  }, { merge: true });
  console.log("Migration for blogs successful!");
}

runMigration();
