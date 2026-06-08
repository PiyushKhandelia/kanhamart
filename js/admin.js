import { protectAdmin } from "./auth.js";
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const usersCollection =
  collection(db, "users");

/* ==========================================
   ADMIN PROTECTION
========================================== */

protectAdmin();

/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentCategoryId = null;
let currentProductId = null;

const categoriesCollection = collection(db, "categories");
const productsCollection = collection(db, "products");

/* ==========================================
   GROCERY ICONS
========================================== */

const groceryIcons = [
  { icon: "🥛", name: "Milk" },
  { icon: "🍞", name: "Bread" },
  { icon: "🍚", name: "Rice" },
  { icon: "🍎", name: "Apple" },
  { icon: "🍌", name: "Banana" },
  { icon: "🥔", name: "Potato" },
  { icon: "🥕", name: "Carrot" },
  { icon: "🍅", name: "Tomato" },
  { icon: "🧅", name: "Onion" },
  { icon: "🌶️", name: "Chilli" },
  { icon: "🥚", name: "Egg" },
  { icon: "🍗", name: "Chicken" },
  { icon: "🐟", name: "Fish" },
  { icon: "🍫", name: "Chocolate" },
  { icon: "🍪", name: "Biscuit" },
  { icon: "🧃", name: "Juice" },
  { icon: "🥤", name: "Soft Drink" },
  { icon: "☕", name: "Coffee" },
  { icon: "🍵", name: "Tea" },
  { icon: "🧈", name: "Butter" }
];

/* ==========================================
   INITIALIZE
========================================== */

window.addEventListener("DOMContentLoaded", async () => {

setupDashboardCards();

renderIconPicker();

await loadDashboardCounts();

await loadCategoriesDropdown();

await renderCategories();

await renderProducts();

await loadOrders();

await loadCustomersCount();

await renderCustomers();

});

/* ==========================================
   DASHBOARD CARD SWITCHING
========================================== */

function setupDashboardCards() {

  const cards =
    document.querySelectorAll(".dashboard-card");

  cards.forEach(card => {

    card.addEventListener("click", () => {

      const target =
        card.dataset.target;

      if (!target) return;

      document
        .querySelectorAll(".dashboard-card")
        .forEach(c =>
          c.classList.remove("active-card")
        );

      card.classList.add("active-card");

      document
        .querySelectorAll(".admin-section")
        .forEach(section =>
          section.classList.add("hidden")
        );

      document
        .getElementById(target)
        .classList.remove("hidden");

    });

  });

}

/* ==========================================
   ICON PICKER
========================================== */

const iconSearch =
  document.getElementById("iconSearch");

const iconResults =
  document.getElementById("iconResults");

const pIcon =
  document.getElementById("pIcon");

function renderIconPicker(filter = "") {

  iconResults.innerHTML = "";

  const icons =
    groceryIcons.filter(item =>
      item.name
      .toLowerCase()
      .includes(filter.toLowerCase())
    );

  icons.forEach(item => {

    const div =
      document.createElement("div");

    div.className = "icon-item";

    div.innerHTML = `
      <span>${item.icon}</span>
      <small>${item.name}</small>
    `;

    div.addEventListener("click", () => {

      document
        .querySelectorAll(".icon-item")
        .forEach(i =>
          i.classList.remove("selected")
        );

      div.classList.add("selected");

      pIcon.value = item.icon;
    });

    iconResults.appendChild(div);

  });

}

iconSearch?.addEventListener("input", e => {

  renderIconPicker(e.target.value);

});

/* ==========================================
   DASHBOARD COUNTS
========================================== */

async function loadDashboardCounts() {

  const catSnap =
    await getDocs(categoriesCollection);

  const prodSnap =
    await getDocs(productsCollection);

  const orderSnap =
    await getDocs(
      collection(db, "orders")
    );

  document.getElementById(
    "totalCategories"
  ).textContent = catSnap.size;

  document.getElementById(
    "totalProducts"
  ).textContent = prodSnap.size;

  document.getElementById(
    "totalOrders"
  ).textContent = orderSnap.size;

}

/* ==========================================
   CATEGORY DROPDOWN
========================================== */

async function loadCategoriesDropdown() {

  const select =
    document.getElementById("pCategory");

  const editSelect =
    document.getElementById("editPCategory");

  select.innerHTML =
    '<option value="">Select Category</option>';

  editSelect.innerHTML =
    '<option value="">Select Category</option>';

  const snap =
    await getDocs(categoriesCollection);

  snap.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category.id;
    option.textContent =
      category.data().name;

    select.appendChild(option);

    editSelect.appendChild(
      option.cloneNode(true)
    );

  });

}

/* ==========================================
   ADD CATEGORY
========================================== */

document
.getElementById("addCategoryBtn")
?.addEventListener("click", async () => {

  const name =
    document
    .getElementById("catName")
    .value
    .trim();

  if (!name)
    return alert(
      "Enter category name"
    );

  await addDoc(
    categoriesCollection,
    {
      name,
      createdAt: new Date()
    }
  );

  document.getElementById(
    "catName"
  ).value = "";

  await refreshAdmin();

});

/* ==========================================
   RENDER CATEGORIES
========================================== */

async function renderCategories() {

  const table =
    document.getElementById(
      "categoriesTable"
    );

  const snap =
    await getDocs(categoriesCollection);

  let html = `
    <div class="table-wrapper">
    <table class="data-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
  `;

  snap.forEach(category => {

    html += `
      <tr>

        <td>
          ${category.data().name}
        </td>

        <td>

          <button
            class="btn-edit"
            onclick="editCategory('${category.id}')">

            Edit

          </button>

          <button
            class="btn-delete"
            onclick="deleteCategory('${category.id}')">

            Delete

          </button>

        </td>

      </tr>
    `;

  });

  html += `
      </tbody>
    </table>
    </div>
  `;

  table.innerHTML = html;
}

/* ==========================================
   ADD PRODUCT
========================================== */

document
.getElementById("addProductBtn")
?.addEventListener("click", async () => {

  const name =
    document.getElementById("pName")
    .value.trim();

  const price =
    document.getElementById("pPrice")
    .value;

  const description =
    document.getElementById("pDesc")
    .value.trim();

  const categoryId =
    document.getElementById("pCategory")
    .value;

  const icon =
    document.getElementById("pIcon")
    .value || "🛒";

  const mfgDate =
    document.getElementById("pMfg")
    .value || null;

  const expDate =
    document.getElementById("pExp")
    .value || null;

  if (
    !name ||
    !price ||
    !description ||
    !categoryId
  ) {
    return alert(
      "Please fill all required fields"
    );
  }

  await addDoc(
    productsCollection,
    {
      name,
      price: Number(price),
      description,
      categoryId,
      icon,
      mfgDate,
      expDate,
      createdAt: new Date()
    }
  );

  alert("Product added successfully");

  clearProductForm();

  await refreshAdmin();

});

/* ==========================================
   RENDER PRODUCTS
========================================== */

async function renderProducts() {

  const table =
    document.getElementById(
      "productsTable"
    );

  const productsSnap =
    await getDocs(productsCollection);

  let html = `
    <div class="table-wrapper">

    <table class="data-table">

      <thead>

        <tr>
          <th>Icon</th>
          <th>Product</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>

      </thead>

      <tbody>
  `;

  productsSnap.forEach(product => {

    const p = product.data();

    html += `
      <tr>

        <td class="product-display-icon">
          ${p.icon || "🛒"}
        </td>

        <td>
          ${p.name}
        </td>

        <td>
          ₹${p.price}
        </td>

        <td>

          <button
            class="btn-edit"
            onclick="editProduct('${product.id}')">

            Edit

          </button>

          <button
            class="btn-delete"
            onclick="deleteProduct('${product.id}')">

            Delete

          </button>

        </td>

      </tr>
    `;

  });

  html += `
      </tbody>

    </table>

    </div>
  `;

  table.innerHTML = html;
}

/* ==========================================
   LOAD ORDERS
========================================== */

let currentOrderFilter = "All";

window.filterOrders = function(status){

    currentOrderFilter = status;

    loadOrders();

};

async function loadOrders(){

    const ordersSnap =
        await getDocs(
            collection(db,"orders")
        );

    const container =
        document.getElementById(
            "ordersContainer"
        );

    container.innerHTML = "";

    let pending = 0;
    let confirmed = 0;
    let delivery = 0;
    let delivered = 0;
    let cancelled = 0;

    ordersSnap.forEach(orderDoc => {

        const order =
            orderDoc.data();

        switch(order.status){

            case "Pending":
                pending++;
                break;

            case "Confirmed":
                confirmed++;
                break;

            case "Out for Delivery":
                delivery++;
                break;

            case "Delivered":
                delivered++;
                break;

            case "Cancelled":
                cancelled++;
                break;
        }

        if(
            currentOrderFilter !== "All" &&
            order.status !== currentOrderFilter
        ){
            return;
        }

        let productsHtml = "";

        order.items?.forEach(item => {

            productsHtml += `

                <div class="order-product-row">

                    <span>
                        ${item.icon}
                        ${item.name}
                    </span>

                    <span>
                        ${item.quantity} × ₹${item.price}
                    </span>

                </div>

            `;

        });

        container.innerHTML += `

            <div class="admin-order-card">

                <div class="order-card-header">

                    <div>

                        <h3>
                            ${order.customerName || "Customer"}
                        </h3>

                        <p>
                            ${order.customerPhone || ""}
                        </p>

                    </div>

                    <span class="status-badge">

                        ${order.status}

                    </span>

                </div>

                <div class="order-address">

                    📍
                    ${order.deliveryAddress || ""}

                </div>

                <div class="order-products">

                    ${productsHtml}

                </div>

                <div class="order-total">

                    Total :
                    ₹${order.total}

                </div>

                <div class="order-actions">

                    <button
                        onclick="changeOrderStatus(
                        '${orderDoc.id}',
                        'Confirmed'
                        )">

                        Confirm

                    </button>

                    <button
                        onclick="changeOrderStatus(
                        '${orderDoc.id}',
                        'Out for Delivery'
                        )">

                        Dispatch

                    </button>

                    <button
                        onclick="changeOrderStatus(
                        '${orderDoc.id}',
                        'Delivered'
                        )">

                        Deliver

                    </button>

                    <button
                        onclick="changeOrderStatus(
                        '${orderDoc.id}',
                        'Cancelled'
                        )">

                        Cancel

                    </button>

                </div>

            </div>

        `;

    });

    document.getElementById(
        "totalOrders"
    ).textContent =
        ordersSnap.size;

    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;

    document.getElementById(
        "confirmedCount"
    ).textContent =
        confirmed;

    document.getElementById(
        "deliveryCount"
    ).textContent =
        delivery;

    document.getElementById(
        "deliveredCount"
    ).textContent =
        delivered;

    document.getElementById(
        "cancelledCount"
    ).textContent =
        cancelled;

}

window.changeOrderStatus =
async function(orderId,status){

  await updateDoc(
    doc(
      db,
      "orders",
      orderId
    ),
    {
      status
    }
  );

  await loadOrders();

};

/* ==========================================
   EDIT CATEGORY
========================================== */

window.editCategory =
async function(id) {

  currentCategoryId = id;

  const categoryDoc =
    await getDoc(
      doc(db, "categories", id)
    );

  document.getElementById(
    "editCategoryName"
  ).value =
    categoryDoc.data().name;

  document
    .getElementById(
      "editCategoryModal"
    )
    .classList.remove("hidden");

};

/* ==========================================
   UPDATE CATEGORY
========================================== */

document
.getElementById("updateCategoryBtn")
?.addEventListener("click", async () => {

  const name =
    document
    .getElementById(
      "editCategoryName"
    )
    .value.trim();

  if (!name)
    return alert(
      "Enter category name"
    );

  await updateDoc(
    doc(
      db,
      "categories",
      currentCategoryId
    ),
    { name }
  );

  closeCategoryModal();

  await refreshAdmin();

});

/* ==========================================
   DELETE CATEGORY
========================================== */

window.deleteCategory =
async function(id) {

  const confirmDelete =
    confirm(
      "Delete this category?"
    );

  if (!confirmDelete)
    return;

  await deleteDoc(
    doc(
      db,
      "categories",
      id
    )
  );

  await refreshAdmin();

};

/* ==========================================
   EDIT PRODUCT
========================================== */

window.editProduct =
async function(id) {

  currentProductId = id;

  const productDoc =
    await getDoc(
      doc(db, "products", id)
    );

  const p =
    productDoc.data();

  document
    .getElementById("editPName")
    .value = p.name;

  document
    .getElementById("editPPrice")
    .value = p.price;

  document
    .getElementById("editPDesc")
    .value = p.description;

  document
    .getElementById("editPCategory")
    .value = p.categoryId;

  document
    .getElementById("editPIcon")
    .value = p.icon || "🛒";

  document
    .getElementById(
      "editProductModal"
    )
    .classList.remove("hidden");

};

/* ==========================================
   UPDATE PRODUCT
========================================== */

document
.getElementById("updateProductBtn")
?.addEventListener("click", async () => {

  await updateDoc(
    doc(
      db,
      "products",
      currentProductId
    ),
    {
      name:
        document
        .getElementById("editPName")
        .value,

      price:
        Number(
          document
          .getElementById("editPPrice")
          .value
        ),

      description:
        document
        .getElementById("editPDesc")
        .value,

      categoryId:
        document
        .getElementById("editPCategory")
        .value,

      icon:
        document
        .getElementById("editPIcon")
        .value
    }
  );

  closeProductModal();

  await refreshAdmin();

});

/* ==========================================
   DELETE PRODUCT
========================================== */

window.deleteProduct =
async function(id) {

  const confirmDelete =
    confirm(
      "Delete this product?"
    );

  if (!confirmDelete)
    return;

  await deleteDoc(
    doc(
      db,
      "products",
      id
    )
  );

  await refreshAdmin();

};

/* ==========================================
   MODAL FUNCTIONS
========================================== */

window.closeCategoryModal =
function() {

  document
    .getElementById(
      "editCategoryModal"
    )
    .classList.add("hidden");

};

window.closeProductModal =
function() {

  document
    .getElementById(
      "editProductModal"
    )
    .classList.add("hidden");

};

/* ==========================================
   CLEAR PRODUCT FORM
========================================== */

function clearProductForm() {

  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pDesc").value = "";
  document.getElementById("pCategory").value = "";
  document.getElementById("pIcon").value = "";
  document.getElementById("pMfg").value = "";
  document.getElementById("pExp").value = "";

}

/* ==========================================
   REFRESH ADMIN
========================================== */

async function refreshAdmin() {

  await loadDashboardCounts();

  await loadCategoriesDropdown();

  await renderCategories();

  await renderProducts();

  await loadOrders();

  await loadCustomersCount();

  await renderCustomers();

}

/* Customer Management*/

async function loadCustomersCount() {

  const userSnap =
    await getDocs(usersCollection);

  document.getElementById(
    "totalCustomers"
  ).textContent =
    userSnap.size;

}

  /*Load Customers*/
  async function renderCustomers() {

  const table =
    document.getElementById(
      "customersTable"
    );

  const snap =
    await getDocs(usersCollection);

  let html = `
    <div class="table-wrapper">

    <table class="data-table">

      <thead>

        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>

      </thead>

      <tbody>
  `;

  snap.forEach(userDoc => {

    const user =
      userDoc.data();

    html += `
      <tr>

        <td>
          ${user.name || "-"}
        </td>

        <td>
          ${user.email || "-"}
        </td>

        <td>
          ${user.role || "user"}
        </td>

      </tr>
    `;

  });

  html += `
      </tbody>
    </table>

    </div>
  `;

  table.innerHTML = html;

}