import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBqQANAlTnPHwZP99frdo58HARevm8mt3M",
  authDomain: "vital-f681c.firebaseapp.com",
  projectId: "vital-f681c",
  storageBucket: "vital-f681c.firebasestorage.app",
  messagingSenderId: "925141116581",
  appId: "1:925141116581:web:2e941f24ba227bd1c00f4c",
  measurementId: "G-JP6LR2LMQ2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;