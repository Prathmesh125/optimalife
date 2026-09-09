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
  console.log("Starting Migration to Structured Sections for CAREERS page...");
  
  const docRef = db.collection('pages').doc('careers');
  const docSnap = await docRef.get();
  
  let legacyContent = "";
  if (docSnap.exists) {
    legacyContent = docSnap.data().content || "";
  } else {
    console.error("Careers page not found in DB. Creating it.");
  }

  // Extract the specific job from the legacy markdown 
  // It looks like:
  // ### Current Opening
  // ### Department: Business Development
  // ### Designation : Zonal Sales Manager (West)
  // ### Location: Pune
  // Qualifications & Skills ...

  let jobs = [];
  if (legacyContent.includes("Zonal Sales Manager")) {
    const jobDescription = `### Department: Business Development\n\n**Qualifications & Skills**\n* Bachelor's degree in Life Sciences, Business (MBA preferred), B.V.Sc/M.V.Sc./B.Sc./M.Sc.\n* Minimum 5-7 years of Regional Sales Manager experience in the Animal life sciences / Animal Feed Additive sector.\n* Proven track record in team management and achieving sales targets.\n* Strong communication, negotiation, and analytical skills.\n* Proficiency in CRM tools and MS Office.\n\n**Role Objective**\nTo drive sales growth, customer engagement, and market expansion within the assigned zone by leading and mentoring a team of 5 sales executives, ensuring alignment with Optima Life Sciences' strategic goals.\n\n### Key Responsibilities\n**Team Leadership**\nSupervise, coach, and motivate a team of 5 sales executives.\nConduct regular performance reviews and set clear KPIs.`;

    jobs.push({
      id: "job-1",
      title: "Zonal Sales Manager (West)",
      location: "Pune, MH",
      type: "Full-Time",
      description: jobDescription
    });
  }

  const newSections = {
    header: {
      title: "Build the Future of Animal Health",
      subtitle: "We are always looking for passionate, driven individuals to join our team in Pune and across India. Explore our open positions below."
    },
    jobs: jobs
  };

  await docRef.set({ 
    title: "CAREERS",
    slug: "careers",
    sections: newSections 
  }, { merge: true });
  console.log("Migration for careers successful!");
}

runMigration();
