import { auth, db, provider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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
      location.href = "../public/login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists() || snap.data().role !== "admin") {
      alert("Unauthorized access");
      location.href = "../index.html";
    }
  });
}

/* =======================
Already logged in
↓
Open login.html
↓
Automatically redirected to Home
======================= */

onAuthStateChanged(auth, async (user) => {

  const isLoginPage =
    window.location.pathname.includes(
      "login.html"
    );

  if (user && isLoginPage) {

  const snap = await getDoc(
    doc(db, "users", user.uid)
  );

  if (
    snap.exists() &&
    snap.data().role === "admin"
  ) {

    window.location.href =
      "../public/admin.html";

  } else {

    window.location.href =
      "../index.html";

  }

}

});

/* =======================
Admin Login
======================= */

export async function adminLogin(email,password){

  try{

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user =
      result.user;

    const snap =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );

    if(
      snap.exists() &&
      snap.data().role === "admin"
    ){

      window.location.href = "../public/admin.html";

    }else{

      alert(
        "Not an admin account"
      );

      await signOut(auth);

    }

  }catch(error){

    console.error(error);

if(error.code === "auth/user-not-found"){
  alert("Admin account not found");
}
else if(error.code === "auth/wrong-password"){
  alert("Incorrect password");
}
else{
  alert(error.message);
}

  }

}
