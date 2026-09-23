// =========================
// DELIVERY CHARGE
// =========================

const deliveryOptions = document.querySelectorAll('input[name="delivery"]');

function getDeliveryCharge() {

    const selectedDelivery = document.querySelector(
        'input[name="delivery"]:checked'
    );

    if (selectedDelivery && selectedDelivery.value === 'outside') {
        return 120;
    }

    return 80;
}


// =========================
// CART
// =========================

let cart = JSON.parse(
    localStorage.getItem('nijerBajarCart')
) || [];


// =========================
// CART COUNT
// =========================

const cartCount = document.querySelector('.cart');

function updateCartCount() {

    if (cartCount) {
        cartCount.textContent = '🛒 Cart (' + cart.length + ')';
    }

}

updateCartCount();


// =========================
// SAVE CART
// =========================

function saveCart() {

    localStorage.setItem(
        'nijerBajarCart',
        JSON.stringify(cart)
    );

}


// =========================
// ADD TO CART
// =========================

const cartButtons = document.querySelectorAll('.cart-btn');

cartButtons.forEach(function(button) {

    button.addEventListener('click', function() {

        const productCard = this.closest('.product-card');

        if (!productCard) {
            return;
        }

        const productName = productCard.querySelector('h3').textContent;

        const productPrice = productCard.querySelector('.price span').textContent;

        cart.push({
            name: productName,
            price: productPrice
        });

        saveCart();

        updateCartCount();

        alert(productName + ' added to cart!');

    });

});


// =========================
// SHOW CART PRODUCTS
// =========================

const cartItemsContainer = document.getElementById(
    'cart-items-container'
);

function displayCartProducts() {

    if (!cartItemsContainer) {
        return;
    }

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to continue.</p>
                <a href="index.html" class="continue-btn">
                    Continue Shopping
                </a>
            </div>
        `;

        updateOrderSummary();

        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.forEach(function(product, index) {

        const cartItem = document.createElement('div');

        cartItem.className = 'cart-product';

        cartItem.innerHTML = `
            <div class="cart-product-info">

                <h3>${product.name}</h3>

                <p>Price: ${product.price}</p>

                <p>Quantity: 1</p>

            </div>

            <button 
                class="remove-cart-btn"
                data-index="${index}"
                type="button"
            >
                ×
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);

    });

    addRemoveButtons();

}


// =========================
// REMOVE FROM CART
// =========================

function addRemoveButtons() {

    const removeButtons = document.querySelectorAll(
        '.remove-cart-btn'
    );

    removeButtons.forEach(function(button) {

        button.addEventListener('click', function() {

            const index = Number(
                this.getAttribute('data-index')
            );

            cart.splice(index, 1);

            saveCart();

            updateCartCount();

            displayCartProducts();

            updateOrderSummary();

        });

    });

}


// =========================
// ORDER SUMMARY
// =========================

function updateOrderSummary() {

    const summaryRows = document.querySelectorAll(
        '.order-summary .summary-row'
    );

    const subtotalElement = summaryRows[0]
        ? summaryRows[0].querySelector('strong')
        : null;

    const deliveryElement = summaryRows[1]
        ? summaryRows[1].querySelector('strong')
        : null;

    const totalElement = document.querySelector(
        '.order-summary .summary-total strong'
    );

    if (!subtotalElement || !deliveryElement || !totalElement) {
        return;
    }

    let subtotal = 0;

    cart.forEach(function(product) {

        const price = parseFloat(
            product.price.replace(/[^\d.]/g, '')
        );

        subtotal += price;

    });

    const delivery = getDeliveryCharge();

    const total = subtotal + delivery;

    subtotalElement.textContent = '৳' + subtotal;

    deliveryElement.textContent = '৳' + delivery;

    totalElement.textContent = '৳' + total;

}


// =========================
// DELIVERY CHANGE
// =========================

deliveryOptions.forEach(function(option) {

    option.addEventListener('change', function() {

        updateOrderSummary();

    });

});


// =========================
// INITIAL LOAD
// =========================

displayCartProducts();

updateOrderSummary();

// =========================
// CONFIRM ORDER
// =========================

const confirmOrderButton = document.getElementById(
    'confirm-order-btn'
);

if (confirmOrderButton) {

    confirmOrderButton.addEventListener('click', function() {

        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const district = document.getElementById('district').value;
        const area = document.getElementById('area').value.trim();
        const address = document.getElementById('address').value.trim();

        const selectedDelivery = document.querySelector(
            'input[name="delivery"]:checked'
        );

        if (!name || !mobile || !district || !area || !address) {

            alert('Please fill in all customer information.');

            return;
        }

        const delivery =
            selectedDelivery && selectedDelivery.value === 'outside'
                ? 'Outside Dhaka - ৳120'
                : 'Inside Dhaka - ৳80';

        let products = cart.map(function(product) {

    return product.name + ' - ' + product.price;

}).join(' | ');

        const subtotal = cart.reduce(function(total, product) {

            return total + parseFloat(
                product.price.replace(/[^\d.]/g, '')
            );

        }, 0);

        const deliveryCharge =
            selectedDelivery && selectedDelivery.value === 'outside'
                ? 120
                : 80;

        const total = subtotal + deliveryCharge;

        console.log("PRODUCTS:", products);
        const orderData = {

            orderId: 'NB-' + Date.now(),

            date: new Date().toLocaleString(),

            customerName: name,

            phone: mobile,

            address:
                district +
                ', ' +
                area +
                ', ' +
                address,

            delivery: delivery,

            products: products,
            total: '৳' + total

        };

        fetch(GOOGLE_SHEET_URL, {

            method: 'POST',

            mode: 'no-cors',

            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },

            body: JSON.stringify(orderData)

        });
    // SHOW SUCCESS POPUP IMMEDIATELY

    const successModal = document.getElementById('success-modal');

    if (successModal) {
        successModal.classList.add('show');
    }

});
        
}
// =========================
// GOOGLE SHEET CONNECTION
// =========================

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxcOrlN_lu6Fk_uS42FwbgVajln_o70OVCRuh1-bfRkXWfiwqwtYUPE9x5smA-f-Ca0/exec";

// =========================
// DIVISION → DISTRICT
// =========================

const divisionSelect = document.getElementById('division');
const districtSelect = document.getElementById('district');

const districts = {

    Dhaka: [
        'Dhaka',
        'Faridpur',
        'Gazipur',
        'Gopalganj',
        'Kishoreganj',
        'Madaripur',
        'Manikganj',
        'Munshiganj',
        'Narayanganj',
        'Narsingdi',
        'Rajbari',
        'Shariatpur',
        'Tangail'
    ],

    Chattogram: [
        'Bandarban',
        'Brahmanbaria',
        'Chandpur',
        'Chattogram',
        'Cumilla',
        "Cox's Bazar",
        'Feni',
        'Khagrachhari',
        'Lakshmipur',
        'Noakhali',
        'Rangamati'
    ],

    Rajshahi: [
        'Bogura',
        'Chapainawabganj',
        'Joypurhat',
        'Naogaon',
        'Natore',
        'Pabna',
        'Rajshahi',
        'Sirajganj'
    ],

    Khulna: [
        'Bagerhat',
        'Chuadanga',
        'Jashore',
        'Jhenaidah',
        'Khulna',
        'Kushtia',
        'Magura',
        'Meherpur',
        'Narail',
        'Satkhira'
    ],

    Barishal: [
        'Barguna',
        'Barishal',
        'Bhola',
        'Jhalokati',
        'Patuakhali',
        'Pirojpur'
    ],

    Sylhet: [
        'Habiganj',
        'Moulvibazar',
        'Sunamganj',
        'Sylhet'
    ],

    Rangpur: [
        'Dinajpur',
        'Gaibandha',
        'Kurigram',
        'Lalmonirhat',
        'Nilphamari',
        'Panchagarh',
        'Rangpur',
        'Thakurgaon'
    ],

    Mymensingh: [
        'Jamalpur',
        'Mymensingh',
        'Netrokona',
        'Sherpur'
    ]

};

if (divisionSelect && districtSelect) {

    divisionSelect.addEventListener('change', function() {

        const selectedDivision = this.value;

        districtSelect.innerHTML =
            '<option value="">Select District</option>';

        if (districts[selectedDivision]) {

            districts[selectedDivision].forEach(function(district) {

                const option = document.createElement('option');

                option.value = district;
                option.textContent = district;

                districtSelect.appendChild(option);

            });

        }

    });

}
// =========================
// SUCCESS POPUP OK
// =========================

const successOkButton = document.getElementById('success-ok-btn');
const successModal = document.getElementById('success-modal');

if (successOkButton) {

    successOkButton.addEventListener('click', function() {

        // Close popup
        successModal.classList.remove('show');

        // Clear cart
        cart = [];

        saveCart();

        updateCartCount();

        displayCartProducts();

        updateOrderSummary();

        // Clear customer information
        const customerForm = document.querySelector(
            '.customer-form form'
        );

        if (customerForm) {
            customerForm.reset();
        }

        // Reset delivery to Inside Dhaka
        const insideDelivery = document.querySelector(
            'input[name="delivery"][value="inside"]'
        );

        if (insideDelivery) {
            insideDelivery.checked = true;
        }

        updateOrderSummary();

    });

}

// =========================
// BUY NOW
// =========================

const buyButtons = document.querySelectorAll('.buy-btn');

buyButtons.forEach(function(button) {

    button.addEventListener('click', function() {

        const productCard = this.closest('.product-card');

        if (!productCard) {
            return;
        }

        const productName =
            productCard.querySelector('h3').textContent;

        const productPrice =
            productCard.querySelector('.price span').textContent;

        // Only selected product
        cart = [{
            name: productName,
            price: productPrice
        }];

        saveCart();

        updateCartCount();

        // Go to customer information
        window.location.href =
            'cart.html#customer-information';

    });

});

// =========================
// BUY NOW → CUSTOMER FORM
// =========================

if (window.location.hash === '#customer-information') {

    const customerInformation =
        document.getElementById('customer-information');

    if (customerInformation) {

        setTimeout(function() {

            customerInformation.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        }, 300);

    }

}

// =========================
// AUTO LOAD PRODUCTS
// =========================

const PRODUCT_API_URL =
    "https://script.google.com/macros/s/AKfycbyMnxQWKH3M7kCQQsHhf91heihs9bg5zdpIxxgKq-N6Jg46a9NykRscsxrUrvdR1-1UhQ/exec";

const productGrid = document.getElementById('product-grid');

if (productGrid) {

    fetch(PRODUCT_API_URL)

        .then(function(response) {
            return response.json();
        })

        .then(function(products) {

            let filteredProducts = products;

            // HOME PAGE → Popular Products
            if (document.getElementById('popular')) {

                filteredProducts = products.filter(function(product) {

                    return String(product.Popular).toLowerCase() === 'yes';

                });

            }

            // BEAUTY PAGE → Beauty Care
            else if (
                document.title.includes('Beauty Care')
            ) {

                filteredProducts = products.filter(function(product) {

                    return String(product.Category).toLowerCase() === 'beauty care';

                });

            }

            // CLOTHING PAGE → Clothing
            else if (
                document.title.includes('Clothing')
            ) {

                filteredProducts = products.filter(function(product) {

                    return String(product.Category).toLowerCase() === 'clothing';

                });

            }


            productGrid.innerHTML = '';


            filteredProducts.forEach(function(product) {

                const card = document.createElement('div');

                card.className = 'product-card';


                card.innerHTML = `

                    <div class="product-image">

                        <img
                            src="${product['Image URL']}"
                            alt="${product['Product Name']}"
                        >

                        ${
                            document.getElementById('popular')
                            ? `<span class="sale-badge">Popular</span>`
                            : ''
                        }

                    </div>


                    <div class="product-info">

                        <p class="product-category">
                            ${product.Category}
                        </p>

                        <h3>
                            ${product['Product Name']}
                        </h3>

                        <p style="font-size:13px;color:#777;margin-bottom:10px;line-height:1.5;">
                            ${product.Description}
                        </p>


                        <div class="rating">
                            ${'★'.repeat(Number(product.Rating) || 0)}
                        </div>


                        <div class="price">

                            <span>
                                ৳${product.Price}
                            </span>

                            ${
                                product['Old Price']
                                ? `<del>৳${product['Old Price']}</del>`
                                : ''
                            }

                        </div>


                        <div class="product-buttons">

                            <button
                                class="buy-btn"
                                type="button"
                            >
                                Buy Now
                            </button>

                            <button
                                class="cart-btn"
                                type="button"
                            >
                                Add to Cart
                            </button>

                        </div>

                    </div>

                `;


                productGrid.appendChild(card);

            });

        })


        .catch(function(error) {

            console.error(
                'Product loading error:',
                error
            );

            productGrid.innerHTML = `
                <p style="text-align:center;width:100%;color:#777;">
                    Products could not be loaded.
                </p>
            `;

        });

}


// =========================
// DYNAMIC PRODUCT BUTTON FIX
// =========================

if (productGrid) {

    productGrid.addEventListener('click', function(event) {

        const button =
            event.target.closest('button');

        if (!button) {
            return;
        }


        const productCard =
            button.closest('.product-card');

        if (!productCard) {
            return;
        }


        const productName =
            productCard.querySelector('h3').textContent.trim();


        const productPrice =
            productCard.querySelector('.price span').textContent.trim();


        // =========================
        // ADD TO CART
        // =========================

        if (button.classList.contains('cart-btn')) {

            cart.push({
                name: productName,
                price: productPrice
            });

            saveCart();

            updateCartCount();

            alert(
                productName +
                ' added to cart!'
            );

        }


        // =========================
        // BUY NOW
        // =========================

        if (button.classList.contains('buy-btn')) {

            cart = [{
                name: productName,
                price: productPrice
            }];

            saveCart();

            updateCartCount();

            window.location.href =
                'cart.html#customer-information';

        }

    });

}