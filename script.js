// 🔥 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 CONFIG (REPLACE THIS)
const firebaseConfig = {
    apiKey: "AIzaSyARpxyEbhg3vchTigKLt6fo2UMSGXXi4tk",
    authDomain: "iml-diary.firebaseapp.com",
    projectId: "iml-diary"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let user = null;
let notes = {};
let selectedDateKey = "";

// ================= LOGIN =================
document.getElementById("loginBtn").onclick = () => {
    signInWithPopup(auth, provider);
};

document.getElementById("logoutBtn").onclick = () => {
    signOut(auth);
};

onAuthStateChanged(auth, async (u) => {
    if (u) {
        user = u;

        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("userInfo").style.display = "flex";

        document.getElementById("userName").innerText = u.displayName;
        document.getElementById("userPic").src = u.photoURL;

        await loadNotes();
        generateCalendar();

    } else {
        user = null;
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("userInfo").style.display = "none";
    }
});

// ================= NOTES =================
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
    refreshIndicators();
}

// ================= CALENDAR =================
const calendar = document.getElementById("calendar");
const year = new Date().getFullYear();

function generateCalendar() {
    calendar.innerHTML = "";

    for (let m = 0; m < 12; m++) {
        const monthDiv = document.createElement("div");

        monthDiv.innerHTML = `<h2>${new Date(year, m).toLocaleString('default',{month:'long'})}</h2>`;

        const daysDiv = document.createElement("div");
        daysDiv.className = "days";

        const days = new Date(year, m+1, 0).getDate();

        for (let d = 1; d <= days; d++) {
            const day = document.createElement("div");
            day.className = "day";
            day.innerText = d;

            const key = `${year}-${m+1}-${d}`;

            if (notes[key]) day.classList.add("saved");

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

// ================= UI =================
function refreshIndicators() {
    document.querySelectorAll(".day").forEach(el => {
        const d = el.innerText;
        const m = el.closest("div").previousSibling?.innerText;

        const key = `${year}-${m}-${d}`;
        if (notes[key]) el.classList.add("saved");
    });
}

document.getElementById("saveBtn").onclick = saveNote;

// ================= DATE JUMP =================
document.getElementById("datePicker").onchange = function () {
    const date = new Date(this.value);
    const month = date.getMonth();

    calendar.children[month].scrollIntoView({
        behavior: "smooth"
    });
};