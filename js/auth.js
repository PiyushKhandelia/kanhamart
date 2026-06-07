import { auth, db, provider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

let isSigningIn = false;

/* =======================
   GOOGLE POPUP LOGIN
======================= */
export async function login() {
  if (isSigningIn) return;
  isSigningIn = true;

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        role: "user",
        createdAt: new Date()
      });
    }

    window.location.href = "../index.html";

  } catch (error) {
    if (error.code === "auth/cancelled-popup-request") {
      console.warn("Login popup cancelled by browser/user.");
    } else {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  } finally {
    isSigningIn = false;
  }
}

/* =======================
   ADMIN PAGE PROTECTION
======================= */
export function protectAdmin() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "public/login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists() || snap.data().role !== "admin") {
      alert("Unauthorized access");
      location.href = "index.html";
    }
  });
}
