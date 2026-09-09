import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Load service account
const serviceAccount = JSON.parse(
  fs.readFileSync("/Users/prathmeshd/Downloads/optimalife/optimalife-83bce-firebase-adminsdk-fbsvc-7bfe119ad5.json", "utf8")
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const uid = "wyVcFlXlblWBivAfOJpfBaj05bn1";

async function makeAdmin() {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully granted admin privileges to UID: ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
}

makeAdmin();
