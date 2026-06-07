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

      location.href = "public/login.html";
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

  snap.forEach(doc => {

    const address =
      doc.data();

    container.innerHTML += `

      <div
        class="address-card checkout-address"
        onclick="selectAddress('${doc.id}')">

        <h3>

          ${address.fullName}

        </h3>

        <p>

          ${address.address}

        </p>

      </div>

    `;

  });

}

window.selectAddress =
function(id){

  selectedAddress = id;

  document
  .querySelectorAll(
    ".checkout-address"
  )
  .forEach(card =>
    card.classList.remove(
      "active-address"
    )
  );

  event.currentTarget
    .classList.add(
      "active-address"
    );

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

    await placeOrder(
      selectedAddress
    );

  }
);