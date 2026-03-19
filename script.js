// ================= IMPORT FIREBASE =================
import { auth, db, provider } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= GLOBAL =================
let user = null;
let notes = {};
let selectedDateKey = "";

const calendar = document.getElementById("calendar");
const editor = document.getElementById("sideEditor");
const year = new Date().getFullYear();

// ================= AUTH =================
const isLoginPage = window.location.pathname.includes("login.html");

onAuthStateChanged(auth, async (u) => {

    if (u) {
        user = u;

        // ONLY redirect if on login page
        if (isLoginPage) {
            window.location.href = "index.html";
            return;
        }

        document.getElementById("userName").innerText = u.displayName;
        document.getElementById("userPic").src = u.photoURL;

        await loadNotes();
        generateCalendar();

    } else {
        // ONLY redirect if NOT already on login page
        if (!isLoginPage) {
            window.location.href = "login.html";
        }
    }
});

// ================= LOGOUT =================
document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    // DO NOT manually redirect here
};

// ================= FIRESTORE =================
async function loadNotes() {
    const ref = doc(db, "notes", user.uid);
    const snap = await getDoc(ref);

    notes = snap.exists() ? snap.data() : {};
}

async function saveNote() {
    const text = document.getElementById("noteInput").value;

    if (text.trim()) {
        notes[selectedDateKey] = text;
    } else {
        delete notes[selectedDateKey];
    }

    await setDoc(doc(db, "notes", user.uid), notes);

    closeEditor();
    generateCalendar();
}

// ================= CALENDAR =================
function generateCalendar() {
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

            day.setAttribute("data-day", d);

            const key = `${year}-${m + 1}-${d}`;

            if (notes[key]) {
                day.classList.add("saved");
            }

            day.onclick = () => openEditor(key);

            daysDiv.appendChild(day);
        }

        monthDiv.appendChild(daysDiv);
        calendar.appendChild(monthDiv);
    }
}

// ================= SIDE EDITOR =================
function openEditor(dateKey) {
    selectedDateKey = dateKey;

    document.getElementById("selectedDate").innerText = dateKey;
    document.getElementById("noteInput").value = notes[dateKey] || "";

    editor.classList.add("open");
}

window.closeEditor = function () {
    editor.classList.remove("open");
};

// ================= EVENTS =================
document.getElementById("saveBtn").onclick = saveNote;

// ================= DATE PICKER =================
document.getElementById("datePicker").addEventListener("change", function () {
    const date = new Date(this.value);
    const month = date.getMonth();

    if (calendar.children[month]) {
        calendar.children[month].scrollIntoView({
            behavior: "smooth"
        });
    }
});