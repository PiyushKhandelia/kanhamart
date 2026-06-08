javascript
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ==========================================
   GLOBALS
========================================== */

let currentUser = null;

const addressCollection =
    collection(db, "addresses");

/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    await loadAddresses();

});

/* ==========================================
   SAVE ADDRESS
========================================== */

document
.getElementById("saveAddressBtn")
?.addEventListener("click", saveAddress);

async function saveAddress() {

    try {

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

            alert("Please fill all required fields");
            return;

        }

        if (!/^[0-9]{10}$/.test(phone)) {

            alert("Please enter a valid 10 digit phone number");
            return;

        }

        if (!/^[0-9]{6}$/.test(pincode)) {

            alert("Please enter a valid 6 digit pincode");
            return;

        }

        const existingAddresses =
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

        const isFirstAddress =
            existingAddresses.empty;

        await addDoc(
            addressCollection,
            {
                userId: currentUser.uid,
                fullName,
                phone,
                address,
                landmark,
                city,
                pincode,
                isDefault: isFirstAddress,
                createdAt: new Date()
            }
        );

        clearForm();

        await loadAddresses();

        alert("Address saved successfully");

    } catch (error) {

        console.error(error);

        alert(
            "Failed to save address"
        );

    }

}

/* ==========================================
   LOAD ADDRESSES
========================================== */

async function loadAddresses() {

    const container =
        document.getElementById(
            "addressesContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    try {

        const snap =
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
                            ?
                            `
                            <span class="default-badge">
                                Default
                            </span>
                            `
                            :
                            ""
                        }

                    </div>

                    <h3>

                        ${address.fullName}

                    </h3>

                    <p>

                        ${address.address}

                        <br>

                        ${
                            address.landmark
                            ?
                            address.landmark + "<br>"
                            :
                            ""
                        }

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
                            ?
                            `
                            <button
                                class="btn-default"
                                onclick="setDefaultAddress('${docSnap.id}')">

                                Set Default

                            </button>
                            `
                            :
                            ""
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

    } catch (error) {

        console.error(error);

    }

}

/* ==========================================
   SET DEFAULT
========================================== */

window.setDefaultAddress =
async function(addressId) {

    try {

        const snap =
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

    } catch (error) {

        console.error(error);

    }

};

/* ==========================================
   DELETE ADDRESS
========================================== */

window.deleteAddress =
async function(addressId) {

    try {

        const confirmed =
            confirm(
                "Delete this address?"
            );

        if (!confirmed) return;

        await deleteDoc(
            doc(
                db,
                "addresses",
                addressId
            )
        );

        const remaining =
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

        let hasDefault = false;

        remaining.forEach(doc => {

            if (doc.data().isDefault) {

                hasDefault = true;

            }

        });

        if (
            !hasDefault &&
            !remaining.empty
        ) {

            const firstDoc =
                remaining.docs[0];

            await updateDoc(
                doc(
                    db,
                    "addresses",
                    firstDoc.id
                ),
                {
                    isDefault:true
                }
            );

        }

        await loadAddresses();

    } catch (error) {

        console.error(error);

    }

};

/* ==========================================
   CLEAR FORM
========================================== */

function clearForm() {

    document.getElementById("addressName").value = "";
    document.getElementById("addressPhone").value = "";
    document.getElementById("addressLine").value = "";
    document.getElementById("addressLandmark").value = "";
    document.getElementById("addressCity").value = "";
    document.getElementById("addressPincode").value = "";

}