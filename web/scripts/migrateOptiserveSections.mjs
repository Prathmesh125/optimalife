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

// Helper to clean Markdown
function cleanMarkdown(text) {
  let cleaned = text.replace(/\[\s*!\[.*?\]\(.*?\)\s*\]\(.*?\)/g, ''); // Remove wrapped images
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, ''); // Remove inline images
  
  // Clean up excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

async function runMigration() {
  console.log("Starting Migration to Structured Sections for OPTISERVE page...");
  
  const docRef = db.collection('pages').doc('optiserve');
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error("Optiserve page not found in DB.");
    return;
  }
  
  const data = docSnap.data();
  const content = cleanMarkdown(data.content || "");
  
  const getImage = (keyword) => {
    if (!data.images) return "";
    const imgs = data.images.filter((img) => 
      img.filename.toLowerCase().includes(keyword.toLowerCase()) && 
      !img.filename.includes('150x150') && 
      !img.filename.includes('300x')
    );
    return imgs.length > 0 ? imgs[0].url : "";
  };

  const introImage = getImage('optiserve_cropped') || getImage('feed-formulation');
  const infographicImage = getImage('optiserve-1-1536') || getImage('Group-89');
  const heroImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop";

  // Extract Intro text
  const introMatch = content.match(/^[\s\S]*?(?=###\s*01)/i);
  let introText = introMatch ? introMatch[0] : content;

  // Extract Services
  const extractService = (num, titlePattern) => {
    const regex = new RegExp(`###\\s*${num}\\s*${titlePattern}[\\s\\S]*?(?=(?:###\\s*0\\d|$))`, 'i');
    const match = content.match(regex);
    if (match) {
      let svcContent = match[0].replace(new RegExp(`###\\s*${num}\\s*${titlePattern}[^\\n]*\\n`, 'i'), '');
      return svcContent.trim();
    }
    return "";
  };

  const rawServicesList = [
    { id: '01', title: 'Feed Formulation', search: 'feed formulation', imgKeyword: 'feed-formulation' },
    { id: '02', title: 'Near Infrared Spectroscopy (NIR)', search: 'near infrared spectroscopy', imgKeyword: '2_11zon' },
    { id: '03', title: 'Wet Chemistry', search: 'wet chemistry', imgKeyword: 'Wet-Chemistry' },
    { id: '04', title: 'Microbiology', search: 'microbiology', imgKeyword: 'Microbiology' },
    { id: '05', title: 'Drinking Water Analysis', search: 'drinking water', imgKeyword: 'Drinking-Water' },
    { id: '06', title: 'Technical Services and Training', search: 'technical services', imgKeyword: 'Technical-Services' },
    { id: '07', title: 'Milling Solutions', search: 'milling solutions', imgKeyword: 'Milling-Solutions' },
    { id: '08', title: 'Hatchery Audit', search: 'hatchery audit', imgKeyword: 'Hatchery-Audit' },
  ];

  const services = rawServicesList.map(s => ({
    id: s.id,
    title: s.title,
    content: extractService(s.id, s.search),
    image: getImage(s.imgKeyword)
  })).filter(s => s.content !== "");

  const newSections = {
    hero: {
      image: heroImage,
      title: "Optiserve"
    },
    intro: {
      text: introText.trim(),
      image: introImage
    },
    infographic: {
      image: infographicImage
    },
    services: services
  };

  await docRef.set({ sections: newSections }, { merge: true });
  console.log("Migration for optiserve successful!");
}

runMigration();
