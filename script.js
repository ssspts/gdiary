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
const year = new Date().getFullYear();

// AUTH
onAuthStateChanged(auth, async (u) => {

    if (u) {
        user = u;

        document.getElementById("userName").innerText = u.displayName;
        document.getElementById("userPic").src = u.photoURL;

        await loadNotes();
        renderCalendar();

    } else {
        window.location.href = "login.html";
    }
});

// LOGOUT
document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
};

// LOAD NOTES
async function loadNotes() {
    const snap = await getDoc(doc(db, "notes", user.uid));
    notes = snap.exists() ? snap.data() : {};
}

// SAVE NOTE
async function saveNote() {
    const text = document.getElementById("noteInput").value;

    if (text) notes[selectedDate] = text;
    else delete notes[selectedDate];

    await setDoc(doc(db, "notes", user.uid), notes);

    closeEditor();
    renderCalendar();
}

// CALENDAR
function renderCalendar() {
    calendar.innerHTML = "";

    for (let m = 0; m < 12; m++) {

        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        const name = new Date(year, m).toLocaleString("default", { month: "long" });
        monthDiv.innerHTML = `<h3>${name}</h3>`;

        const grid = document.createElement("div");
        grid.className = "grid";

        const days = new Date(year, m + 1, 0).getDate();

        for (let d = 1; d <= days; d++) {

            const day = document.createElement("div");
            day.className = "day";

            const key = `${year}-${m+1}-${d}`;

            if (notes[key]) day.classList.add("saved");

            day.innerHTML = `<span>${d}</span>`;

            day.onclick = () => openEditor(key);

            grid.appendChild(day);
        }

        monthDiv.appendChild(grid);
        calendar.appendChild(monthDiv);
    }
}

// EDITOR
function openEditor(date) {
    selectedDate = date;

    document.getElementById("selectedDate").innerText = date;
    document.getElementById("noteInput").value = notes[date] || "";

    editor.classList.add("open");
}

window.closeEditor = function () {
    editor.classList.remove("open");
};

// SAVE BTN
document.getElementById("saveBtn").onclick = saveNote;

// DATE PICKER SCROLL
document.getElementById("datePicker").addEventListener("change", function () {
    const month = new Date(this.value).getMonth();
    calendar.children[month].scrollIntoView({ behavior: "smooth" });
});