import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBn1bLxnAaVNxod1fuU4tE2eBmPldfHjkg",
  authDomain: "subscription-tracker-2c2bf.firebaseapp.com",
  projectId: "subscription-tracker-2c2bf",
  storageBucket: "subscription-tracker-2c2bf.firebasestorage.app",
  messagingSenderId: "492485864368",
  appId: "1:492485864368:web:287df22c41c86e50a70475",
  measurementId: "G-4DFGLLB109",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;
