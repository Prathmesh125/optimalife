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
  process.exit(1);
}

const db = getFirestore();

function extractSection(content, titlePattern) {
    const regex = new RegExp(`###?\\s*${titlePattern}[\\s\\S]*?(?=(?:###?|\\n####|$))`, 'i');
    const match = content.match(regex);
    if (match) {
        let contentWithoutHeading = match[0].replace(new RegExp(`###?\\s*${titlePattern}[^\\n]*\\n`, 'i'), '');
        let textOnly = contentWithoutHeading.replace(/\[\s*!\[.*?\]\(.*?\)\s*\]\(.*?\)/g, '');
        textOnly = textOnly.replace(/!\[.*?\]\(.*?\)/g, '').trim();
        return textOnly;
    }
    return "";
}

async function runMigration() {
  console.log("Starting Migration to Structured Sections...");
  
  const aboutUsRef = db.collection('pages').doc('about-us');
  const aboutUsDoc = await aboutUsRef.get();
  
  if (!aboutUsDoc.exists) {
    console.log("About Us page not found.");
    return;
  }
  
  const data = aboutUsDoc.data();
  let content = data.content || "";

  // Manually parse what we know is in there based on the frontend logic
  
  // Hero (Welcome To)
  let heroText = extractSection(content, 'Welcome To');
  if (!heroText) {
     // fallback if it's the very first text
     const parts = content.split('###');
     heroText = parts[0].replace(/!\[.*?\]\(.*?\)/g, '').replace(/## Welcome To\n?OPTIMA LIFE SCIENCES/, '').trim();
  }

  // Our Journey
  const journeyText = extractSection(content, 'Our Journey');
  const visionText = extractSection(content, 'our vision');
  const missionText = extractSection(content, 'our mission');
  const valuesText = extractSection(content, 'OUR VALUES');
  const socialGoodText = extractSection(content, 'promoting social good');
  const foundationsText = extractSection(content, 'our foundations for achievement');

  const newSections = {
    hero: {
      title: "Welcome To OPTIMA LIFE SCIENCES",
      text: heroText
    },
    journey: {
      title: "Our Journey",
      text: journeyText,
      // Default to what we know is there
      imageUrl: "https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/pages/about-us/1725807156170-Updated_11zon.png" 
    },
    vision: {
      title: "Our Vision",
      text: visionText
    },
    mission: {
      title: "Our Mission",
      text: missionText
    },
    values: {
      title: "Our Values",
      text: valuesText
    },
    socialGood: {
      title: "PROMOTING SOCIAL GOOD",
      text: socialGoodText,
      images: [
        "https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/pages/about-us/1725807156149-1.png",
        "https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/pages/about-us/1725807156156-2.png",
        "https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/pages/about-us/1725807156163-5.png"
      ]
    },
    foundations: {
      title: "OUR FOUNDATIONS FOR ACHIEVEMENT",
      text: foundationsText,
      imageUrl: "https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/pages/about-us/1725807156141-8.png"
    }
  };

  await aboutUsRef.update({
    sections: newSections
  });

  console.log("Migration for about-us successful!");
}

runMigration();
