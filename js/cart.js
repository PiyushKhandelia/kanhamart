import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

/* ==========================================
   CURRENT USER
========================================== */

let currentUser = null;

onAuthStateChanged(auth, user => {

  if(user){

    currentUser = user;

    updateCartBadge();

  }

});

/* ==========================================
   ADD TO CART
========================================== */

export async function addToCart(product){

  if(!currentUser){

    alert("Please login first");

    return;
  }

  const cartRef =
    doc(db,"carts",currentUser.uid);

  const cartSnap =
    await getDoc(cartRef);

  let items = [];

  if(cartSnap.exists()){

    items =
      cartSnap.data().items || [];

  }

  const existing =
    items.find(
      item =>
      item.productId === product.id
    );

  if(existing){

    existing.quantity++;

  }else{

    items.push({

      productId: product.id,

      name: product.name,

      price: product.price,

      icon: product.icon || "🛒",

      quantity: 1

    });

  }

 await setDoc(
  cartRef,
  { items },
  { merge:true }
);

  updateCartBadge();

  alert(
    `${product.name} added to cart`
  );

}

/* ==========================================
   CART BADGE
========================================== */

export async function updateCartBadge(){

  if(!currentUser) return;

  const badge =
    document.getElementById(
      "cartCount"
    );

  if(!badge) return;

  const cartSnap =
    await getDoc(
      doc(
        db,
        "carts",
        currentUser.uid
      )
    );

  if(!cartSnap.exists()){

    badge.textContent = 0;

    return;
  }

  const items =
    cartSnap.data().items || [];

  let count = 0;

  items.forEach(item => {

    count += item.quantity;

  });

  badge.textContent = count;
}

/* ==========================================
   LOAD CART
========================================== */

export async function loadCart(){

  if(!currentUser) return [];

  const snap =
    await getDoc(
      doc(
        db,
        "carts",
        currentUser.uid
      )
    );

  if(!snap.exists()){

    return [];

  }

  return snap.data().items || [];
}

/* ==========================================
   UPDATE QUANTITY
========================================== */

export async function updateQuantity(
  productId,
  change
){

  const cartRef =
    doc(
      db,
      "carts",
      currentUser.uid
    );

  const snap =
    await getDoc(cartRef);

  if(!snap.exists()){
   return;
}

  const items =
    snap.data().items || [];

  const item =
    items.find(
      i =>
      i.productId === productId
    );

  if(!item) return;

  item.quantity += change;

  const filtered =
    items.filter(
      i =>
      i.quantity > 0
    );

  await updateDoc(
    cartRef,
    {
      items: filtered
    }
  );

  updateCartBadge();
}

/* ==========================================
   REMOVE ITEM
========================================== */

export async function removeItem(
  productId
){

  const cartRef =
    doc(
      db,
      "carts",
      currentUser.uid
    );

  const snap =
    await getDoc(cartRef);

  if(!snap.exists()){
   return;
}
    
  const items =
    snap.data().items || [];

  const filtered =
    items.filter(
      item =>
      item.productId !== productId
    );

  await updateDoc(
    cartRef,
    {
      items: filtered
    }
  );

  updateCartBadge();
}