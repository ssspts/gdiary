// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 YOUR CONFIG (SAFE HERE)
const firebaseConfig = {
    apiKey: "AIzaSyARpxyEbhg3vchTigKLt6fo2UMSGXXi4tk",
    authDomain: "iml-diary.firebaseapp.com",
    projectId: "iml-diary"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();