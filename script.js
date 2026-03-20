import { auth, db } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let user = null;
let notes = {};
let selectedDate = "";

const calendar = document.getElementById("calendar");
const editor = document.getElementById("sideEditor");

// AUTH (NO LOOP)
onAuthStateChanged(auth, async (u) => {

    if (!u) {
        window.location.href = "login.html";
        return;
    }

    user = u;

    document.getElementById("userName").innerText = u.displayName;
    document.getElementById("userPic").src = u.photoURL;

    await loadNotes();
    renderCalendar();
});

// LOGOUT
document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
};

// LOAD
async function loadNotes() {
    const snap = await getDoc(doc(db, "notes", user.uid));
    notes = snap.exists() ? snap.data() : {};
}

// SAVE
async function saveNote() {
    const val = document.getElementById("noteInput").value;

    if (val) notes[selectedDate] = val;
    else delete notes[selectedDate];

    await setDoc(doc(db, "notes", user.uid), notes);

    closeEditor();
    renderCalendar();
}

// CALENDAR
function renderCalendar() {
    calendar.innerHTML = "";

    const year = new Date().getFullYear();

    for (let m = 0; m < 12; m++) {
        const month = document.createElement("div");
        month.className = "month";

        const grid = document.createElement("div");
        grid.className = "grid";

        const days = new Date(year, m + 1, 0).getDate();

        for (let d = 1; d <= days; d++) {
            const day = document.createElement("div");
            day.className = "day";

            const key = `${year}-${m+1}-${d}`;

            if (notes[key]) day.classList.add("saved");

            day.innerText = d;
            day.onclick = () => openEditor(key);

            grid.appendChild(day);
        }

        month.appendChild(grid);
        calendar.appendChild(month);
    }
}

// EDITOR
function openEditor(date) {
    selectedDate = date;
    document.getElementById("noteInput").value = notes[date] || "";
    document.getElementById("selectedDate").innerText = date;
    editor.classList.add("open");
}

window.closeEditor = () => editor.classList.remove("open");

// SAVE BTN
document.getElementById("saveBtn").onclick = saveNote;

// DATE PICKER
document.getElementById("datePicker").addEventListener("change", function () {
    const month = new Date(this.value).getMonth();
    calendar.children[month].scrollIntoView({ behavior: "smooth" });
});