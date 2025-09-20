// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC6lLVkYIPLBfG3FCvhIO-j5vJVYQ0294Q",
  authDomain: "fit5032-9023a.firebaseapp.com",
  projectId: "fit5032-9023a",
  storageBucket: "fit5032-9023a.firebasestorage.app",
  messagingSenderId: "788910569357",
  appId: "1:788910569357:web:498e2d5617adaf8c1f6fc4",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);



export const fs   = getFirestore(app)
export { firebaseApp, auth, db };
