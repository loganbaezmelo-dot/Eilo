import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This pulls the secret config you put in Vercel's Environment Variables 💀
const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;
const firebaseConfig = rawConfig ? JSON.parse(rawConfig) : {};

// Initialize the "Body" of the robot's cloud brain 😭
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export the specific "Nerves" we need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
