import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATyVUMbAw193eEQ0dKsyJ2FPbS7nBH8zY",
  authDomain: "pocket-heist-dscott.firebaseapp.com",
  projectId: "pocket-heist-dscott",
  storageBucket: "pocket-heist-dscott.firebasestorage.app",
  messagingSenderId: "1041224157529",
  appId: "1:1041224157529:web:4fe8d5f29f4adc9af6a448",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
