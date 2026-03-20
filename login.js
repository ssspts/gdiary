import { auth, provider } from "./firebase.js";

import {
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// If already logged in → go to index
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "index.html";
    }
});

// Login button
document.getElementById("loginBtn").onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = "index.html";
    } catch (err) {
        console.error(err);
    }
};