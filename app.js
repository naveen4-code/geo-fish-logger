import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCv_ilNgMS6GzjZiEoPAv4HOiFZJZ2bwk",
  authDomain: "geo-tagged-fish-catcher.firebaseapp.com",
  projectId: "geo-tagged-fish-catcher",
  storageBucket: "geo-tagged-fish-catcher.appspot.com",
  messagingSenderId: "546391140370",
  appId: "1:546391140370:web:3c7bd00bc9c215d66450cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userEmail = null;
let lat = null;
let lng = null;

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login to use the app.");
    window.location.href = "login.html";
  } else {
    userEmail = user.email;
    document.getElementById("user-info").innerHTML = `
      <span style="color:white">👋 Welcome, ${user.displayName || user.email}</span>
      <button onclick="logout()" style="margin-left:10px; background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px;">Logout</button>
    `;
  }
});

window.logout = function () {
  signOut(auth).then(() => location.href = "login.html");
};

// Map
const map = L.map('map').setView([10.0, 78.0], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.on('click', (e) => {
  lat = e.latlng.lat;
  lng = e.latlng.lng;
  alert(`📍 Location selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
});

// Compress and convert image to Base64
function compressAndConvertToBase64(file, maxWidth = 500, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const scaleSize = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Compress to 70%
      const byteSize = Math.round((dataUrl.length * 3) / 4);

      callback(dataUrl, byteSize);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Form submit
document.getElementById("catchForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!lat || !lng) {
    alert("⚠️ Please click on the map to select a location!");
    return;
  }

  const species = document.getElementById("species").value;
  const weight = document.getElementById("weight").value;
  const file = document.getElementById("photo").files[0];

  if (!file) {
    alert("⚠️ Please upload a photo of the catch.");
    return;
  }

  compressAndConvertToBase64(file, 500, async (photoBase64, sizeInBytes) => {
    if (sizeInBytes > 900000) {
      alert("❌ Image too large after compression. Please upload a smaller one.");
      return;
    }

    try {
      await addDoc(collection(db, "catches"), {
        species,
        weight,
        lat,
        lng,
        time: new Date().toISOString(),
        user: userEmail,
        name: auth.currentUser.displayName || userEmail,
        photo: photoBase64
      });

      alert("✅ Catch submitted successfully!");
      location.reload();
    } catch (error) {
      console.error("❌ Firestore save error:", error.code, error.message);
      alert("❌ Failed to submit catch.");
    }
  });
});
