import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

console.log("Initializing Firebase..."); 

const firebaseConfig = {
    apiKey: "AIzaSyDgc3p8f7z7aIC1pgqW51HRFg-SaOjQPAs",
    authDomain: "meal-planner-f28a2.firebaseapp.com",
    projectId: "meal-planner-f28a2",
    storageBucket: "meal-planner-f28a2.firebasestorage.app",
    messagingSenderId: "21441098730",
    appId: "1:21441098730:web:b3592b0bc55736adcd7893",
    measurementId: "G-3E0CG5N5GL"
  };

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase initialized successfully");

export { db };