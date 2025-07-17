import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "your_api_key",
  authDomain: "geo-tagged-fish-catcher.firebaseapp.com",
  projectId: "geo-tagged-fish-catcher"
});
const db = getFirestore(app);

const container = document.getElementById("records");

const snapshot = await getDocs(collection(db, "catches"));
snapshot.forEach(doc => {
  const data = doc.data();
  const div = document.createElement("div");
  div.className = "record-card";
  div.innerHTML = `
    <img src="${data.photo}" width="200" />
    <p><strong>Species:</strong> ${data.species}</p>
    <p><strong>Weight:</strong> ${data.weight} kg</p>
    <p><strong>User:</strong> ${data.user}</p>
    <p><strong>Location:</strong> (${data.lat.toFixed(2)}, ${data.lng.toFixed(2)})</p>
    <p><strong>Time:</strong> ${new Date(data.time).toLocaleString()}</p>
  `;
  container.appendChild(div);
});
