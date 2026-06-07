import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      location.href = "public/login.html";

      return;
    }

    await loadProfile(user);

  }
);

/* ==========================================
   LOAD PROFILE
========================================== */

async function loadProfile(user) {

  const profileName =
    document.getElementById("profileName");

  const profileEmail =
    document.getElementById("profileEmail");

  try {

    const userDoc =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );

    if (userDoc.exists()) {

      const data =
        userDoc.data();

      profileName.textContent =
        data.name || "User";

      profileEmail.textContent =
        data.email || "";

    } else {

      profileName.textContent =
        user.displayName || "User";

      profileEmail.textContent =
        user.email || "";

    }

  } catch (error) {

    console.error(
      "Profile Load Error:",
      error
    );

  }

}

/* ==========================================
   LOGOUT
========================================== */

document
.getElementById("logoutBtn")
?.addEventListener(
  "click",
  async () => {

    const confirmLogout =
      confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout)
      return;

    try {

      await signOut(auth);

      location.href =
        "public/login.html";

    } catch (error) {

      console.error(
        "Logout Error:",
        error
      );

      alert(
        "Logout failed"
      );

    }

  }
);