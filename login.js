import { auth, provider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if(user){
        window.location.href = "index.html";
    }
});

// Google Login
document.getElementById("loginBtn").onclick = async () => {
    try{
        await signInWithPopup(auth, provider);
        // user will be redirected automatically via onAuthStateChanged
    }catch(err){
        console.error("Login failed:", err);
        alert("Login failed. Check console.");
    }
}