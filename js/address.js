import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ==========================================
   GLOBALS
========================================== */

let currentUser = null;

const addressCollection =
  collection(db, "addresses");

/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      location.href = "../public/login.html";

      return;
    }

    currentUser = user;

    await loadAddresses();

  }
);

/* ==========================================
   SAVE ADDRESS
========================================== */

document
.getElementById("saveAddressBtn")
?.addEventListener(
  "click",
  async () => {

    const fullName =
      document
      .getElementById("addressName")
      .value
      .trim();

    const phone =
      document
      .getElementById("addressPhone")
      .value
      .trim();

    const address =
      document
      .getElementById("addressLine")
      .value
      .trim();

    const landmark =
      document
      .getElementById("addressLandmark")
      .value
      .trim();

    const city =
      document
      .getElementById("addressCity")
      .value
      .trim();

    const pincode =
      document
      .getElementById("addressPincode")
      .value
      .trim();

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !pincode
    ) {

      alert(
        "Please fill all required fields"
      );

      return;
    }

    const existing =
      await getDocs(
        query(
          addressCollection,
          where(
            "userId",
            "==",
            currentUser.uid
          )
        )
      );

    const firstAddress =
      existing.empty;

    await addDoc(
      addressCollection,
      {
        userId:
          currentUser.uid,

        fullName,

        phone,

        address,

        landmark,

        city,

        pincode,

        isDefault:
          firstAddress,

        createdAt:
          new Date()
      }
    );

    clearForm();

    await loadAddresses();

    alert(
      "Address saved successfully"
    );

  }
);

/* ==========================================
   LOAD ADDRESSES
========================================== */

async function loadAddresses() {

  const container =
    document.getElementById(
      "addressesContainer"
    );

  container.innerHTML = "";

  const q =
    query(
      addressCollection,
      where(
        "userId",
        "==",
        currentUser.uid
      )
    );

  const snap =
    await getDocs(q);

  if (snap.empty) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>

          No Addresses Found

        </h3>

      </div>
    `;

    return;
  }

  snap.forEach(docSnap => {

    const address =
      docSnap.data();

    container.innerHTML += `

      <div class="address-card">

        <div class="address-top">

          <span class="address-tag">

            Address

          </span>

          ${
            address.isDefault
              ? `
                <span class="default-badge">
                  Default
                </span>
              `
              : ""
          }

        </div>

        <h3>

          ${address.fullName}

        </h3>

        <p>

          ${address.address}

          <br>

          ${address.landmark}

          <br>

          ${address.city}

          -

          ${address.pincode}

        </p>

        <p>

          📞 ${address.phone}

        </p>

        <div class="address-actions">

          ${
            !address.isDefault
              ? `
                <button
                  class="btn-edit"
                  onclick="setDefaultAddress('${docSnap.id}')">

                  Set Default

                </button>
              `
              : ""
          }

          <button
            class="btn-delete"
            onclick="deleteAddress('${docSnap.id}')">

            Delete

          </button>

        </div>

      </div>

    `;

  });

}

/* ==========================================
   SET DEFAULT ADDRESS
========================================== */

window.setDefaultAddress =
async function(addressId) {

  const q =
    query(
      addressCollection,
      where(
        "userId",
        "==",
        currentUser.uid
      )
    );

  const snap =
    await getDocs(q);

  const updates = [];

  snap.forEach(addressDoc => {

    updates.push(
      updateDoc(
        doc(
          db,
          "addresses",
          addressDoc.id
        ),
        {
          isDefault:false
        }
      )
    );

  });

  await Promise.all(updates);

  await updateDoc(
    doc(
      db,
      "addresses",
      addressId
    ),
    {
      isDefault:true
    }
  );

  await loadAddresses();

};

/* ==========================================
   DELETE ADDRESS
========================================== */

window.deleteAddress =
async function(addressId) {

  const confirmDelete =
    confirm(
      "Delete this address?"
    );

  if (!confirmDelete)
    return;

  await deleteDoc(
    doc(
      db,
      "addresses",
      addressId
    )
  );

  await loadAddresses();

};

/* ==========================================
   CLEAR FORM
========================================== */

function clearForm() {

  document.getElementById(
    "addressName"
  ).value = "";

  document.getElementById(
    "addressPhone"
  ).value = "";

  document.getElementById(
    "addressLine"
  ).value = "";

  document.getElementById(
    "addressLandmark"
  ).value = "";

  document.getElementById(
    "addressCity"
  ).value = "";

  document.getElementById(
    "addressPincode"
  ).value = "";

}