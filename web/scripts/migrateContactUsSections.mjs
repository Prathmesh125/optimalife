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
  console.log("Starting Migration to Structured Sections for CONTACT US page...");
  
  const docRef = db.collection('pages').doc('contact-us');
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error("Contact Us page not found in DB. Creating it.");
  }

  const newSections = {
    header: {
      title: "Get in Touch",
      subtitle: "Have questions about our products or services? Our team of experts is here to help you achieve optimum animal health."
    },
    contactInfo: {
      address: "P.NO. 47/2/2, BL 44, LIC Colony,\nParvati, Pune – 411009,\nMaharashtra, India.",
      phone: "020-24420720",
      email: "info@optimalife.in"
    }
  };

  await docRef.set({ 
    title: "CONTACT US",
    slug: "contact-us",
    sections: newSections 
  }, { merge: true });
  console.log("Migration for contact-us successful!");
}

runMigration();
