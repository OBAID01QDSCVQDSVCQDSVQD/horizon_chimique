import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Logging for production debugging
if (typeof window !== 'undefined') {
    console.log("Firebase Init: API Key exists?", !!firebaseConfig.apiKey);
    console.log("Firebase Init: Project ID:", firebaseConfig.projectId);
}

const initFirebase = () => {
    try {
        if (getApps().length === 0) {
            console.log("Initializing new Firebase App...");
            return initializeApp(firebaseConfig);
        }
        console.log("Using existing Firebase App...");
        return getApp();
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
        return initializeApp(firebaseConfig);
    }
};

const app = initFirebase();
const auth = getAuth(app);

export { app, auth };
