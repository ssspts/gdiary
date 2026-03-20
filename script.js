// Firebase auth and database assumed in firebase-config.js

let currentDate = null;
let currentFileId = null;
let files = {}; // {date: [{id, title, content}]}

const datePicker = document.getElementById("datePicker");
const datesList = document.getElementById("datesList");
const filesList = document.getElementById("filesList");
const editor = document.getElementById("editor");
const fileTitle = document.getElementById("fileTitle");

const saveBtn = document.getElementById("saveBtn");
const draftBtn = document.getElementById("draftBtn");
const addFileBtn = document.getElementById("addFileBtn");

const logoutBtn = document.getElementById("logoutBtn");

function init() {
    const today = new Date().toISOString().substr(0, 10);
    datePicker.value = today;
    currentDate = today;
    loadDateFiles(today);
}

datePicker.addEventListener("change", () => {
    currentDate = datePicker.value;
    loadDateFiles(currentDate);
});

function loadDateFiles(date) {
    filesList.innerHTML = "";
    editor.value = "";
    fileTitle.textContent = "Untitled";
    currentFileId = null;

    const userId = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref("users/" + userId + "/files/" + date);
    ref.once("value", snapshot => {
        files[date] = snapshot.val() || [];
        renderFilesList();
    });
}

function renderFilesList() {
    filesList.innerHTML = "";
    const list = files[currentDate] || [];
    list.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f.title || "Untitled";
        li.classList.toggle("active", f.id === currentFileId);
        li.addEventListener("click", () => openFile(f.id));
        filesList.appendChild(li);
    });
}

function openFile(fileId) {
    currentFileId = fileId;
    const f = files[currentDate].find(f => f.id === fileId);
    if(f){
        fileTitle.textContent = f.title || "Untitled";
        editor.value = f.content || "";
        renderFilesList();
    }
}

addFileBtn.addEventListener("click", () => {
    const newId = Date.now().toString();
    const newFile = {id: newId, title: "Untitled", content: ""};
    files[currentDate] = files[currentDate] || [];
    files[currentDate].push(newFile);
    currentFileId = newId;
    renderFilesList();
    openFile(newId);
});

saveBtn.addEventListener("click", () => saveFile("published"));
draftBtn.addEventListener("click", () => saveFile("draft"));

function saveFile(status) {
    if(!currentFileId) return;
    const f = files[currentDate].find(f => f.id === currentFileId);
    if(f){
        f.content = editor.value;
        const userId = firebase.auth().currentUser.uid;
        firebase.database().ref("users/" + userId + "/files/" + currentDate + "/" + currentFileId).set(f)
            .then(() => alert("Saved!"))
            .catch(err => alert(err));
    }
}

function checkAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if(!user) {
            window.location.href = "login.html";
        }
    });
}

logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    });
});

// Initialize
checkAuth();
init();