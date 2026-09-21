import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: "optimalife-83bce",
      clientEmail: "firebase-adminsdk-fbsvc@optimalife-83bce.iam.gserviceaccount.com",
      privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDmVcVDCIMim5Pn\nEDwqLYKIIVTjhw59lGfwlIMQNxJAjn8O272HgypkZAubgAfsXUcecnRzXYAJCQpl\nBSoOKzUBJVN6JSbXpyCjrp1lc3V4LXUc158FhRBJte/IjMXPQ1IvSnpxeSr6V8+W\nM1T/wv7ZFisdWfd/iYKhqhmYhfExeDyo9SchjN3ISpZeGBwIDmR2jrHwgiO9lpnq\nxipIsGvnLu2jwY3Ge+fzdBCczz4NQTPnBupgevia3SoYStvKNu3hrf0beQYSUu8F\nf33sZJcRqFy4S6zwoT4GLpRN88iEnqkZMjUL8zLlWbDOvkciO30+4uLAByrNTwB+\n2hfOXtu3AgMBAAECggEAGWbRG9zm9VyZ+YwBTpd5Q0EFxxfgYboJom8GazXfle4B\nFibmpnixJqQf4ZTDiu4Yh0OREx33Hkf4dP6WTjy2mjs/EwPg3jyIrXR22Dbc+BVv\nSnB/EZFEpBRj7saTlBF1EVER4sy9kCE5+/MKRzB+gXtf4ttGn7KPDPwg2YDAAjfu\nTLoZF+Ud5yb9vlKHJ5X0MuZ9UVkv4slEayFqNsKf+nAWgTx0daJ+WpzROY/FN4lx\nDAp7y+/Di1zBxM1aeYZv8QfZRv9OtBMEfsxoRIw/GZ6Yu5B5LLofcD04VLJdwOhn\nugXsTg1syC4U++Lssal0w8n3VPXQE8NH+72JrlP7GQKBgQD1LjBJMJRWxOuLPXiV\nrisPDO8eebiqyQSCSe9+RFSS7rQDO/7kp6PESuwGv4VRPCYrTroHjMIwRQinMQoe\ni8MapVNTZl+yW7aZjzFBpb4oHenF4qrTBDrMUYaFHXEMHlysZzyRTTZdfNPXspaU\nEBt1XkMCEGW945tyRREmgaWYGQKBgQDwf9+G7oBspqUOKZeyn1fkRIgaNV2XfRMx\nIm31Gb2ZWoVm7ncRHHkJSL+5lrJDaJMkB05uvWwv2LcOA6xfIvgslaNsRsMEtmz9\n/5AGuNy+wjzZmJL+VBCUXotQNNMx4Pc1y5AmIMFNbRjNDO13OaYZXcqktFYaWHcw\n0ltj9bnMTwKBgQDG6/aZKyTvUU2Z5wHSz0B4MZJAM5m0Vuulmb8Jvv6vR6Qdi6u+\ncJTaSb89ql3MDvUY5gLg5T8YUqo2m/8N0W82SzRT0heKaga4iAj6rjKd8ccdmk3m\nbuQVqX9uuPhjUK734bquWOrm5sQpmOe6sWbVzuim4A7sBaK1D3xetYlY4QKBgQCg\nOMCk9w2t1NOPfNwoTwnR9Gor87OXcecwS7yvlmd+3BSVv3apequUKNg5/xBh4jBs\nx0VUd3O06I8DkiTq+LQXl9VZFEdmQ1aXXQQJxmyh1WuOl5wOPdkRz27Gj3rH9xUa\nzLQLArVlLLJiISOu00Q6EAcp9U6LnLZDW1ExZgpS9wKBgAwaVROCKWxsCswYQonv\n7O7Zn3qqqwPWb0GLK+O95IMf0P6WJ+ESN3MdiaEVymLeg37XWjO2Q2Ajzh1tEPaL\nLoSJrz+ZuZZAEzphsXGv8zqOQP9zrmHZVmZGN6CMnI+ImPI5CnzA0FKLsAiFtMWe\nOQ7/XgR2Gr3qFfH4b0hX3RO8\n-----END PRIVATE KEY-----\n`
    }),
  });
}

const db = getFirestore();

const CATEGORIES = [
  { 
    id: "feed-additives", 
    name: "Feed Additives", 
    icon: "Package",
    order: 1,
    description: "Our feed additives take complete care of the nutritional quality of a feed; these depend on a number of factors that include feed presentation, microbial contamination, anti-nutritional factors, digestibility, palatability and intestinal healthfulness. We know that great ingredients are not enough, we are passionate about developing formulations that will keep your animals and birds in optimum shape.",
    subcategories: [
      { id: "cost-effective", name: "Cost Effective Performance Solutions" },
      { id: "gut-health", name: "Gut Health Solutions" },
      { id: "enzyme", name: "Enzyme Solutions" },
      { id: "feed-quality", name: "Feed Quality and Milling Solutions" },
      { id: "mineral", name: "Mineral Solutions" },
    ]
  },
  { 
    id: "bio-security", 
    name: "Bio Security", 
    icon: "Shield",
    order: 2,
    description: "Our biosecurity products are scientifically designed to protect your facility from harmful pathogens and ensure a safe, healthy environment for livestock.",
    subcategories: []
  },
  { 
    id: "dosing-system", 
    name: "Dosing System", 
    icon: "Settings",
    order: 3,
    description: "Advanced dosing systems for precise and reliable delivery of treatments and supplements directly into water lines, minimizing waste and maximizing efficiency.",
    subcategories: []
  },
  { 
    id: "optiserve", 
    name: "Optiserve", 
    icon: "Zap",
    order: 4,
    description: "Comprehensive analytical and consulting services dedicated to optimizing performance and diagnosing critical challenges in your operations.",
    subcategories: []
  },
];

async function migrate() {
  console.log("Migrating product categories...");
  const batch = db.batch();
  
  for (const cat of CATEGORIES) {
    const docRef = db.collection("productCategories").doc(cat.id);
    batch.set(docRef, cat);
  }
  
  await batch.commit();
  console.log("Migration complete!");
}

migrate().catch(console.error);
