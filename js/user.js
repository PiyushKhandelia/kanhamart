import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  addToCart
}
from "./cart.js";

/* ==========================================
   ELEMENTS
========================================== */

const catDiv =
  document.getElementById("categories");

const prodDiv =
  document.getElementById("products");

const searchInput =
  document.getElementById("searchInput");

/* ==========================================
   CATEGORY ICONS
========================================== */

const categoryIcons = {
  Dairy: "🥛",
  Bakery: "🍞",
  Grocery: "🍚",
  Snacks: "🍫",
  Beverages: "🧃",
  Fruits: "🍎",
  Vegetables: "🥕",
  Stationery: "✏️",
  "Daily Essentials": "🧴"
};

/* ==========================================
   GLOBAL PRODUCTS
========================================== */

let allProducts = [];

/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    location.href = "public/login.html";
    return;
  }

  await loadCategories();

  await loadAllProducts();

});

/* ==========================================
   LOAD CATEGORIES
========================================== */

async function loadCategories() {

  catDiv.innerHTML = "";

  const allCard =
    document.createElement("div");

  allCard.className =
    "category-card active";

  allCard.innerHTML = `
      <div class="category-icon">
        🛒
      </div>

      <div class="category-name">
        All
      </div>
  `;

  allCard.onclick = () => {

    setActiveCategory(allCard);

    renderProducts(allProducts);

  };

  catDiv.appendChild(allCard);

  const snap =
    await getDocs(
      collection(db, "categories")
    );

  snap.forEach(doc => {

    const category =
      doc.data();

    const card =
      document.createElement("div");

    card.className =
      "category-card";

    const icon =
      categoryIcons[
        category.name
      ] || "📦";

    card.innerHTML = `
      <div class="category-icon">
        ${icon}
      </div>

      <div class="category-name">
        ${category.name}
      </div>
    `;

    card.onclick = async () => {

      setActiveCategory(card);

      await loadProductsByCategory(
        doc.id
      );

    };

    catDiv.appendChild(card);

  });

}

/* ==========================================
   LOAD ALL PRODUCTS
========================================== */

async function loadAllProducts() {

  prodDiv.innerHTML =
    "<p>Loading products...</p>";

  const snap =
    await getDocs(
      collection(db, "products")
    );

  allProducts = [];

  snap.forEach(doc => {

    allProducts.push({
      id: doc.id,
      ...doc.data()
    });

  });

  renderProducts(allProducts);

}

/* ==========================================
   CATEGORY PRODUCTS
========================================== */

async function loadProductsByCategory(
  categoryId
) {

  const q = query(
    collection(db, "products"),
    where(
      "categoryId",
      "==",
      categoryId
    )
  );

  const snap =
    await getDocs(q);

  const products = [];

  snap.forEach(doc => {

    products.push({
      id: doc.id,
      ...doc.data()
    });

  });

  renderProducts(products);

}

/* ==========================================
   PRODUCT SEARCH
========================================== */

searchInput.addEventListener(
  "input",
  () => {

    const keyword =
      searchInput.value
      .toLowerCase();

    const filtered =
      allProducts.filter(product =>

        product.name
        .toLowerCase()
        .includes(keyword)

        ||

        product.description
        .toLowerCase()
        .includes(keyword)

      );

    renderProducts(filtered);

  }
);

/* ==========================================
   RENDER PRODUCTS
========================================== */

function renderProducts(products) {

  prodDiv.innerHTML = "";

  if (products.length === 0) {

    prodDiv.innerHTML = `
      <div class="empty-state">

        <h3>
          No Products Found
        </h3>

      </div>
    `;

    return;
  }

  products.forEach(product => {

    prodDiv.innerHTML += `

      <div class="product-card">

        <div class="product-icon">

          ${product.icon || "🛒"}

        </div>

        <h4>

          ${product.name}

        </h4>

        <p>

          ${product.description}

        </p>

        <div class="product-footer">

          <div class="product-price">

            ₹${product.price}

          </div>

          <button
            class="add-cart-btn"
            onclick="window.addProductToCart('${product.id}')">
              Add
          </button>

        </div>

      </div>

    `;

  });

}

window.addProductToCart =
async function(id){

  const product =
    allProducts.find(
      p => p.id === id
    );

  if(!product) return;

  await addToCart(product);

}

/* ==========================================
   ACTIVE CATEGORY
========================================== */

function setActiveCategory(activeCard) {

  document
    .querySelectorAll(
      ".category-card"
    )
    .forEach(card =>
      card.classList.remove("active")
    );

  activeCard.classList.add(
    "active"
  );

}