import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyS9ldtax2TLrJQiDyycbzs_goHKUEDFs",
  authDomain: "khana-mart-74890.firebaseapp.com",
  databaseURL: "https://khana-mart-74890-default-rtdb.firebaseio.com",
  projectId: "khana-mart-74890",
  storageBucket: "khana-mart-74890.firebasestorage.app",
  messagingSenderId: "530273955750",
  appId: "1:530273955750:web:ac98cd2721280b39fa6967"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();