import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Super robust config loader 🛡️
let app, auth, db, googleProvider;
const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;

try {
  if (rawConfig && rawConfig.trim() !== "") {
    // Try to parse, but don't die if it's messy 😭
    const firebaseConfig = JSON.parse(rawConfig);
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (e) {
  console.error("Firebase Soul failed to boot 💀", e);
}

// Export everything safely even if they are undefined
export { auth, db, googleProvider };
export default app;
