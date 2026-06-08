import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  placeOrder
}
from "./orders.js";

let selectedAddress = null;
let currentUser = null;

onAuthStateChanged(
  auth,
  async user => {

    if(!user){

      location.href = "login.html";
      return;
    }

    currentUser = user;

    await loadAddresses();

  }
);

async function loadAddresses(){

  const container =
    document.getElementById(
      "checkoutAddresses"
    );

  const snap =
    await getDocs(
      query(
        collection(db,"addresses"),
        where(
          "userId",
          "==",
          currentUser.uid
        )
      )
    );

  container.innerHTML = "";

  if(snap.empty){

  container.innerHTML = `

    <div class="empty-state">

      <h3>
        No Saved Addresses
      </h3>

      <p>
        Please add an address first.
      </p>

      <a href="address.html">

        Add Address

      </a>

    </div>

  `;

  return;
}

  snap.forEach(doc => {

    const address = doc.data();

    if(address.isDefault){
        selectedAddress = doc.id;
    }

    container.innerHTML += `
      <div
        class="address-card checkout-address ${
          address.isDefault ? "active-address" : ""
        }"
        onclick="selectAddress('${doc.id}', this)">

        <h3>${address.fullName}</h3>

        <p>${address.address}</p>

      </div>
    `;
});
}

window.selectAddress =
function(id, element){

  selectedAddress = id;

  document
    .querySelectorAll(".checkout-address")
    .forEach(card =>
      card.classList.remove("active-address")
    );

  element.classList.add("active-address");

};


document
.getElementById(
  "placeOrderBtn"
)
.addEventListener(
  "click",
  async () => {

    if(!selectedAddress){

      alert(
        "Select address"
      );

      return;
    }

    try {

  await placeOrder(selectedAddress);

} catch(error) {

  console.error(error);

  alert(
    "Failed to place order. Please try again."
  );

}

  }
);