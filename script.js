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
let drafts = {};
let selectedDate = "";

// AUTH
onAuthStateChanged(auth, async (u) => {

    if (!u) {
        window.location.href = "login.html";
        return;
    }

    user = u;

    document.getElementById("userName").innerText = u.displayName;
    document.getElementById("userPic").src = u.photoURL;

    await loadData();
    renderDates();
});

// LOGOUT
document.getElementById("logoutBtn").onclick = () => signOut(auth);

// LOAD DATA
async function loadData() {
    const snap = await getDoc(doc(db, "notes", user.uid));
    const data = snap.exists() ? snap.data() : {};

    notes = data.notes || {};
    drafts = data.drafts || {};
}

// RENDER SIDEBAR DATES
function renderDates() {
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";

    const today = new Date();

    for (let i = -30; i <= 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);

        const key = d.toISOString().split("T")[0];

        const div = document.createElement("div");
        div.className = "date-item";
        div.innerText = key;

        div.onclick = () => selectDate(key, div);

        sidebar.appendChild(div);
    }
}

// SELECT DATE
function selectDate(date, element) {
    selectedDate = date;

    document.querySelectorAll(".date-item")
        .forEach(el => el.classList.remove("active"));

    element.classList.add("active");

    document.getElementById("selectedDate").innerText = date;

    const content = notes[date] || drafts[date] || "";
    document.getElementById("editor").innerHTML = content;
}

// SAVE FINAL
document.getElementById("saveBtn").onclick = async () => {
    if (!selectedDate) return;

    notes[selectedDate] = document.getElementById("editor").innerHTML;

    await persist();
};

// SAVE DRAFT
document.getElementById("draftBtn").onclick = async () => {
    if (!selectedDate) return;

    drafts[selectedDate] = document.getElementById("editor").innerHTML;

    await persist();
};

// SAVE TO FIRESTORE
async function persist() {
    await setDoc(doc(db, "notes", user.uid), {
        notes,
        drafts
    });
}