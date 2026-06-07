import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ==========================================
   CURRENT USER
========================================== */

let currentUser = null;

/* ==========================================
   PLACE ORDER
========================================== */

export async function placeOrder(
  addressId
){

  if(!currentUser)
    return;

  const cartRef =
    doc(
      db,
      "carts",
      currentUser.uid
    );

  const cartSnap =
    await getDoc(cartRef);

  if(
    !cartSnap.exists()
  ){

    alert(
      "Cart is empty"
    );

    return;
  }

  const items =
    cartSnap.data().items || [];

  if(items.length === 0){

    alert(
      "Cart is empty"
    );

    return;
  }

  let total = 0;

  items.forEach(item => {

    total +=
      item.price *
      item.quantity;

  });

  total += 20;

  await addDoc(
    collection(
      db,
      "orders"
    ),
    {

      userId:
        currentUser.uid,

      addressId,

      items,

      total,

      status:
        "Pending",

      createdAt:
        new Date()

    }
  );

  await setDoc(
    cartRef,
    {
      items:[]
    }
  );

  alert(
    "Order placed successfully"
  );

  location.href =
    "../public/orders.html";

}

/* ==========================================
   LOAD USER ORDERS
========================================== */

export async function loadOrders(){

  const container =
    document.getElementById(
      "ordersContainer"
    );

  if(!container)
    return;

  const snap =
    await getDocs(
      query(
        collection(
          db,
          "orders"
        ),
        where(
          "userId",
          "==",
          currentUser.uid
        )
      )
    );

  container.innerHTML = "";

  if(snap.empty){

    document
      .getElementById(
        "emptyOrders"
      )
      .classList.remove(
        "hidden"
      );

    return;
  }

  snap.forEach(orderDoc => {

    const order =
      orderDoc.data();

    let itemsHtml = "";

    order.items.forEach(item => {

      itemsHtml += `
        ${item.icon}
        ${item.name}
        ×
        ${item.quantity}
        <br>
      `;

    });

    container.innerHTML += `

      <div class="order-card">

        <div class="order-top">

          <div>

            <h3>

              Order

            </h3>

            <p>

              ${new Date(
                order.createdAt
              ).toLocaleDateString()}

            </p>

          </div>

          <span
            class="status ${order.status.toLowerCase()}">

            ${order.status}

          </span>

        </div>

        <div class="order-items">

          ${itemsHtml}

        </div>

        <div class="order-footer">

          <strong>

            ₹${order.total}

          </strong>

        </div>

      </div>

    `;

  });

}

/* ==========================================
   AUTH
========================================== */

onAuthStateChanged(
  auth,
  async user => {

    if(!user){

      location.href =
        "../public/login.html";

      return;
    }

    currentUser = user;

    await loadOrders();

  }
);