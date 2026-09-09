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

async function runMigration() {
  console.log("Starting Migration to Structured Sections for HOME page...");
  
  const docRef = db.collection('pages').doc('home');
  
  // This is the initial structured schema filled with the content that's currently hardcoded in page.tsx
  const newSections = {
    heroCarousel: [
      {
        image: '/images/hero_lab.jpg',
        badge: 'Advanced Animal Health',
        title: 'Precision Science for \n Optimal Performance'
      },
      {
        image: '/images/hero_farm.jpg',
        badge: 'Sustainable Agriculture',
        title: 'Nurturing Growth, \n Ensuring Health'
      },
      {
        image: '/images/hero_scientist.jpg',
        badge: 'Innovative Research',
        title: 'Pioneering Solutions \n for the Future'
      }
    ],
    welcome: {
      subtitle: 'Est. 2010',
      title: 'Glorious years of Development, Trust & Growth',
      text: 'Optima Life Sciences Pvt. Ltd. is a leading and fast-growing company in the animal health and nutrition sector. We recognize the importance of nurturing relationships that reflect our culture of unwavering ethics and mutual respect.',
      phone: '020-24420720',
      globeImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'
    },
    solutions: {
      subtitle: 'Optimum Animal Health',
      title: 'Innovative Solutions for Modern Farming',
      items: [
        {
          title: 'Feed Additives',
          desc: 'Premium feed supplements that meet the exact requirements of both veterinarians and animal owners.',
          image: '/images/solutions_feed.jpg'
        },
        {
          title: 'Bio-Security',
          desc: 'High-quality disinfectants ensuring comprehensive sanitation from cleaning sheds to upliftment.',
          image: '/images/solutions_bio.jpg'
        },
        {
          title: 'Dosing System',
          desc: 'Extensive range of high performance liquid dosing systems built to the highest quality standards.',
          image: '/images/solutions_dosing.jpg'
        },
        {
          title: 'Optiserve',
          desc: 'Unique product technologies supporting poultry health and performance in every stage of production.',
          image: '/images/solutions_optiserve.jpg'
        }
      ]
    },
    stats: [
      { value: '1M+', label: 'Birds Touched' },
      { value: '50+', label: 'Innovative Products' },
      { value: '10K+', label: 'Loyal Customers' },
      { value: '14+', label: 'Years Experience' }
    ],
    globalPresence: {
      subtitle: 'Global Network',
      title: 'Our Global Presence',
      image: 'https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/home/Updated-Map.png'
    },
    certifications: [
      { name: 'ISO 22000:2018', image: 'https://via.placeholder.com/300x400?text=ISO+22000' },
      { name: 'FAMI-QS', image: '/images/fami-qs-cert.png' },
      { name: 'GMP', image: 'https://via.placeholder.com/300x400?text=GMP' },
      { name: 'HACCP', image: 'https://via.placeholder.com/300x400?text=HACCP' }
    ],
    latestNews: {
      subtitle: 'Our blogs',
      title: 'Latest news',
      items: [
        {
          title: 'Why the Same Probiotic Works Brilliantly on One Farm & Does Absolutely Nothing on the Farm Next Door',
          image: 'https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/home/featured-probiotic-article.jpg',
          link: '/blogs/why-the-same-probiotic'
        },
        {
          title: 'Optima Life Sciences Acquires Cure Medicines India Pvt. Ltd.',
          image: 'https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/home/cure-medicines-acquisition-1.jpg',
          link: '/blogs/optima-acquires-cure'
        },
        {
          title: 'OptiVision Vietnam 2026 – More Than an Offsite: A Future-Readiness Experience',
          image: 'https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/home/optivision-vietnam-2026-11.jpg',
          link: '/blogs/optivision-vietnam'
        }
      ]
    }
  };

  await docRef.set({ sections: newSections }, { merge: true });
  console.log("Migration for home successful!");
}

runMigration();
