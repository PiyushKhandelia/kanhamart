import { auth } from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  loadCart,
  updateQuantity,
  removeItem,
  updateCartBadge
}
from "./cart.js";

/* ==========================================
   ELEMENTS
========================================== */

const cartContainer =
  document.getElementById("cartItems");

const emptyCart =
  document.getElementById("emptyCart");

/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(
  auth,
  async user => {

    if(!user){

      location.href = "../public/login.html";

      return;
    }

    await renderCart();

  }
);

/* ==========================================
   LOAD CART
========================================== */

async function renderCart(){

  const items =
    await loadCart();

  cartContainer.innerHTML = "";

  if(items.length === 0){

    cartContainer.style.display =
      "none";

    emptyCart.classList.remove(
      "hidden"
    );

    updateSummary(
      0,
      0,
      0
    );

    return;
  }

  emptyCart.classList.add(
    "hidden"
  );

  let subtotal = 0;

  items.forEach(item => {

    subtotal +=
      item.price *
      item.quantity;

    cartContainer.innerHTML += `

      <div class="cart-card">

        <div class="cart-product-icon">

          ${item.icon}

        </div>

        <div class="cart-product-info">

          <h3>

            ${item.name}

          </h3>

          <strong>

            ₹${item.price}

          </strong>

        </div>

        <div class="cart-actions">

          <button
            onclick="decreaseQty('${item.productId}')">

            -

          </button>

          <span>

            ${item.quantity}

          </span>

          <button
            onclick="increaseQty('${item.productId}')">

            +

          </button>

          <button
            class="btn-delete"
            onclick="removeCartItem('${item.productId}')">

                Remove

          </button>

        </div>

      </div>

    `;

  });

  const deliveryFee =
    subtotal > 0
      ? 20
      : 0;

  const total =
    subtotal +
    deliveryFee;

  updateSummary(
    subtotal,
    deliveryFee,
    total
  );

}

/* ==========================================
   SUMMARY
========================================== */

function updateSummary(
  subtotal,
  deliveryFee,
  total
){

  document.getElementById(
    "subtotalAmount"
  ).textContent =
    `₹${subtotal}`;

  document.getElementById(
    "deliveryFee"
  ).textContent =
    `₹${deliveryFee}`;

  document.getElementById(
    "totalAmount"
  ).textContent =
    `₹${total}`;

}

/* ==========================================
   INCREASE
========================================== */

window.increaseQty =
async function(productId){

  await updateQuantity(
    productId,
    1
  );

  await updateCartBadge();

  await renderCart();

};

/* ==========================================
   DECREASE
========================================== */

window.decreaseQty =
async function(productId){

  await updateQuantity(
    productId,
    -1
  );

  await updateCartBadge();

  await renderCart();

};

/* ==========================================
   REMOVE ITEM
========================================== */

window.removeCartItem =
async function(productId){

  const confirmDelete =
    confirm(
      "Remove item?"
    );

  if(!confirmDelete)
    return;

  await removeItem(
    productId
  );

  await updateCartBadge();

  await renderCart();

};

/* ==========================================
   CHECKOUT
========================================== */

document
.getElementById(
  "checkoutBtn"
)
?.addEventListener(
  "click",
  () => {

    location.href = "../public/checkout.html";

  }
);