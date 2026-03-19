// ================= IMPORT FIREBASE (CLEAN) =================
import { auth, db, provider } from "./firebase.js";

import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= PAGE CHECK =================
const isLoginPage = window.location.pathname.includes("login.html");

// ================= GLOBAL =================
let user = null;
let notes = {};
let selectedDateKey = "";

// ================= AUTH =================
onAuthStateChanged(auth, async (u) => {

    if (u) {
        user = u;

        // Redirect from login → main
        if (isLoginPage) {
            window.location.href = "index.html";
            return;
        }

        // Navbar info
        const nameEl = document.getElementById("userName");
        const picEl = document.getElementById("userPic");

        if (nameEl) nameEl.innerText = u.displayName;
        if (picEl) picEl.src = u.photoURL;

        await loadNotes();
        generateCalendar();

    } else {
        // Redirect to login if not authenticated
        if (!isLoginPage) {
            window.location.href = "login.html";
        }
    }
});

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "login.html";
    });
}

// ================= FIRESTORE =================
async function loadNotes() {
    const ref = doc(db, "notes", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        notes = snap.data();
    } else {
        notes = {};
    }
}

async function saveNote() {
    const text = document.getElementById("noteInput").value;

    if (text.trim()) {
        notes[selectedDateKey] = text;
    } else {
        delete notes[selectedDateKey];
    }

    await setDoc(doc(db, "notes", user.uid), notes);

    closeModal();
    generateCalendar();
}

// ================= CALENDAR =================
const calendar = document.getElementById("calendar");
const year = new Date().getFullYear();

function generateCalendar() {
    if (!calendar) return;

    calendar.innerHTML = "";

    for (let m = 0; m < 12; m++) {

        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        const monthName = new Date(year, m).toLocaleString('default', { month: 'long' });

        monthDiv.innerHTML = `<h2>${monthName}</h2>`;

        const daysDiv = document.createElement("div");
        daysDiv.className = "days";

        const days = new Date(year, m + 1, 0).getDate();

        for (let d = 1; d <= days; d++) {
            const day = document.createElement("div");
            day.className = "day";

            // Google calendar style
            day.innerText = "";
            day.setAttribute("data-day", d);

            const key = `${year}-${m + 1}-${d}`;

            if (notes[key]) {
                day.classList.add("saved");
            }

            day.onclick = () => openModal(key);

            daysDiv.appendChild(day);
        }

        monthDiv.appendChild(daysDiv);
        calendar.appendChild(monthDiv);
    }
}

// ================= MODAL =================
function openModal(dateKey) {
    selectedDateKey = dateKey;

    document.getElementById("noteModal").style.display = "flex";
    document.getElementById("selectedDate").innerText = dateKey;
    document.getElementById("noteInput").value = notes[dateKey] || "";
}

window.closeModal = function () {
    document.getElementById("noteModal").style.display = "none";
};

// ================= EVENTS =================
const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
    saveBtn.addEventListener("click", saveNote);
}
// ================= LOGIN =================
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Login error:", err);
        }
    });
}