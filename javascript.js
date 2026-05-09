// ========== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Система пользователей
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Проверка на мобильное устройство
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ========== АВТОРИЗАЦИЯ ==========
function isLoggedIn() {
    if (currentUser !== null) return true;
    if (localStorage.getItem('isLoggedIn') === 'true') return true;
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return true;
    }
    return false;
}

function getUserName() {
    if (currentUser) return currentUser.name || currentUser.email.split('@')[0];
    const profile = localStorage.getItem('profile');
    if (profile) {
        try {
            const p = JSON.parse(profile);
            if (p.name) return p.name;
            if (p.email) return p.email.split('@')[0];
        } catch(e) {}
    }
    return 'Гость';
}

function getUserEmail() {
    if (currentUser) return currentUser.email;
    const profile = localStorage.getItem('profile');
    if (profile) {
        try {
            const p = JSON.parse(profile);
            return p.email || null;
        } catch(e) {}
    }
    return null;
}

function saveUserData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = { ...user };
        delete currentUser.password;
        saveUserData();
        
        const savedCart = localStorage.getItem(`cart_${email}`);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        } else {
            cart = [];
        }
        
        const savedWishlist = localStorage.getItem(`wishlist_${email}`);
        if (savedWishlist) {
            wishlist = JSON.parse(savedWishlist);
        } else {
            wishlist = [];
        }
        
        const savedOrders = localStorage.getItem(`orders_${email}`);
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
        } else {
            orders = [];
        }
        
        saveCart();
        saveWishlist();
        saveOrders();
        return true;
    }
    return false;
}

function register(userData) {
    const existing = users.find(u => u.email === userData.email);
    if (existing) return false;
    
    const newUser = {
        id: Date.now(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone || '',
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    currentUser = { ...newUser };
    delete currentUser.password;
    saveUserData();
    
    cart = [];
    wishlist = [];
    orders = [];
    saveCart();
    saveWishlist();
    saveOrders();
    
    return true;
}

function logout() {
    if (currentUser) {
        localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
        localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
        localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(orders));
    }
    
    currentUser = null;
    cart = [];
    wishlist = [];
    orders = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profile');
    saveCart();
    saveWishlist();
    saveOrders();
    
    showToast('👋 Вы вышли из аккаунта');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function updateUserMenu() {
    const userMenuArea = document.querySelector('.user-menu-area');
    if (!userMenuArea) return;
    
    if (isLoggedIn()) {
        const userName = getUserName();
        userMenuArea.innerHTML = `
            <div class="user-menu">
                <div class="user-menu-btn">
                    <i class="fas fa-user-circle user-avatar"></i>
                    <span class="user-name">${escapeHtml(userName)}</span>
                    <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i>
                </div>
                <div class="user-dropdown">
                    <a href="profile.html"><i class="fas fa-user"></i> Профиль</a>
                    <a href="profile.html#orders"><i class="fas fa-box"></i> Мои заказы</a>
                    <a href="profile.html#wishlist"><i class="fas fa-heart"></i> Избранное</a>
                    <hr>
                    <button onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выйти</button>
                </div>
            </div>
        `;
    } else {
        userMenuArea.innerHTML = `<a href="login.html"><i class="fas fa-user"></i></a>`;
    }
}

// ========== ФОНОВЫЕ ЭЛЕМЕНТЫ ==========
function addBackgroundElements() {
    if (isMobile) return;
    
    const hexGrid = document.createElement('div');
    hexGrid.className = 'hex-grid';
    for (let i = 1; i <= 8; i++) {
        const hex = document.createElement('div');
        hex.className = 'hex';
        hexGrid.appendChild(hex);
    }
    document.body.appendChild(hexGrid);
    
    const orbsDiv = document.createElement('div');
    orbsDiv.className = 'neon-orbs';
    orbsDiv.innerHTML = '<div class="neon-orb"></div><div class="neon-orb"></div><div class="neon-orb"></div>';
    document.body.appendChild(orbsDiv);
    
    const lightRays = document.createElement('div');
    lightRays.className = 'light-rays';
    for (let i = 1; i <= 5; i++) {
        const ray = document.createElement('div');
        ray.className = 'ray';
        lightRays.appendChild(ray);
    }
    document.body.appendChild(lightRays);
    
    const starsDiv = document.createElement('div');
    starsDiv.className = 'stars';
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 2 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = Math.random() * 3 + 2 + 's';
        starsDiv.appendChild(star);
    }
    document.body.appendChild(starsDiv);
}

// ========== КОРЗИНА ==========
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (currentUser) {
        localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
    updateCartBadge();
    updateCartPage();
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    if (currentUser) {
        localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
    }
    updateWishlistPage();
    updateWishlistButtons();
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
    if (currentUser) {
        localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(orders));
    }
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => badge.textContent = total);
}

function showToast(message, isError = false, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${escapeHtml(message)}`;
    if (isError) {
        toast.style.background = 'linear-gradient(135deg, #ff4444, #ff0066)';
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function addToCart(id, name, price, icon, quantity = 1) {
    if (!isLoggedIn()) {
        showToast('🔐 Пожалуйста, войдите в аккаунт', true);
        window.location.href = `login.html?redirect=${window.location.pathname.split('/').pop()}`;
        return;
    }
    
    const qty = Math.max(1, Math.min(99, parseInt(quantity) || 1));
    
    const existing = cart.find(item => item.id === id);
    if (existing) {
        const newQty = existing.quantity + qty;
        existing.quantity = Math.min(99, newQty);
    } else {
        cart.push({ id, name, price, quantity: qty, icon });
    }
    saveCart();
    showToast(`✅ ${name} добавлен в корзину!`);
    
    const cartIcon = document.querySelector('.header-icons a[href="cart.html"] i');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        cartIcon.style.color = '#00ffff';
        setTimeout(() => {
            cartIcon.style.transform = '';
            cartIcon.style.color = '';
        }, 300);
    }
}

function removeFromCart(id) {
    const item = cart.find(i => i.id === id);
    if (item && confirm(`Удалить ${item.name} из корзины?`)) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        showToast(`🗑 ${item.name} удалён из корзины`);
    }
}

function updateQuantity(id, quantity) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, Math.min(99, quantity));
        saveCart();
    }
}

// ========== ИЗБРАННОЕ ==========
function toggleWishlist(id, name, price, icon) {
    if (!isLoggedIn()) {
        showToast('🔐 Пожалуйста, войдите в аккаунт', true);
        window.location.href = `login.html?redirect=${window.location.pathname.split('/').pop()}`;
        return;
    }
    
    const existing = wishlist.find(item => item.id === id);
    if (existing) {
        wishlist = wishlist.filter(item => item.id !== id);
        showToast(`💔 ${name} удалён из избранного`);
    } else {
        wishlist.push({ id, name, price, icon });
        showToast(`❤️ ${name} добавлен в избранное!`);
    }
    saveWishlist();
}

function isInWishlist(id) {
    return wishlist.some(item => item.id === id);
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (isInWishlist(id)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

// ========== ОТЗЫВЫ ==========
function addReview(productId, productName, rating, text) {
    const userName = currentUser ? currentUser.name : 'Пользователь';
    
    let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    reviews[productId].push({
        id: Date.now(),
        productName: productName,
        rating: rating,
        text: escapeHtml(text),
        date: new Date().toLocaleDateString('ru-RU'),
        userName: escapeHtml(userName)
    });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    showToast('⭐ Спасибо за отзыв!');
}

function showReviewModal(productId, productName) {
    const modal = document.getElementById('reviewModal');
    if (!modal) return;
    
    modal.classList.add('active');
    modal.dataset.productId = productId;
    modal.dataset.productName = productName;
    
    const reviewText = document.getElementById('reviewText');
    if (reviewText) reviewText.value = '';
    
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('active');
    });
}

// ========== ЗАКАЗЫ ==========
function checkout() {
    if (cart.length === 0) {
        showToast('🛒 Корзина пуста!', true);
        return;
    }
    
    if (confirm('Оформить заказ?')) {
        const newOrder = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ru-RU'),
            items: cart.map(item => ({ ...item })),
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: 'processing'
        };
        
        orders.unshift(newOrder);
        saveOrders();
        cart = [];
        saveCart();
        showToast('🎉 Заказ оформлен! Спасибо за покупку!');
        updateCartPage();
        updateOrdersPage();
    }
}

function repeatOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm('Добавить все товары из этого заказа в корзину?')) {
        order.items.forEach(item => {
            addToCart(item.id, item.name, item.price, item.icon, item.quantity);
        });
        showToast('📦 Товары добавлены в корзину');
    }
}

// ========== ОБНОВЛЕНИЕ СТРАНИЦ ==========
function updateCartPage() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
                <a href="catalog.html" class="btn btn-neon" style="margin-top: 1rem;">Перейти в каталог →</a>
            </div>
        `;
        updateSummary();
        return;
    }
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const total = item.price * item.quantity;
        subtotal += total;
        
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
            <div class="cart-cell product-cell" data-label="Товар">
                <i class="fas ${item.icon}"></i>
                <span style="font-weight: 600;">${escapeHtml(item.name)}</span>
            </div>
            <div class="cart-cell price-cell" data-label="Цена">${item.price.toLocaleString()} ₽</div>
            <div class="cart-cell quantity-cell" data-label="Количество">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" min="1" max="99" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="cart-cell total-cell" data-label="Сумма">${total.toLocaleString()} ₽</div>
            <div class="cart-cell action-cell" data-label="">
                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        container.appendChild(row);
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
        };
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item && item.quantity < 99) updateQuantity(id, item.quantity + 1);
        };
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.onchange = () => {
            const id = parseInt(input.dataset.id);
            let val = parseInt(input.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 99) val = 99;
            updateQuantity(id, val);
        };
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = () => removeFromCart(parseInt(btn.dataset.id));
    });
    
    updateSummary();
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const subtotalEl = document.querySelector('.cart-subtotal');
    const totalEl = document.querySelector('.cart-total');
    const itemsEl = document.querySelector('.items-count');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString() + ' ₽';
    if (totalEl) totalEl.textContent = subtotal.toLocaleString() + ' ₽';
    if (itemsEl) itemsEl.textContent = itemsCount;
}

function updateOrdersPage() {
    const ordersContainer = document.getElementById('ordersList');
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>📦 У вас пока нет заказов</p><a href="catalog.html" class="btn-small">Перейти в каталог</a></div>';
        return;
    }
    
    ordersContainer.innerHTML = '';
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        orderDiv.innerHTML = `
            <div class="order-header">
                <span class="order-id"><i class="fas fa-receipt"></i> Заказ № ${order.id}</span>
                <span class="order-status ${order.status === 'delivered' ? 'status-delivered' : 'status-processing'}">
                    ${order.status === 'delivered' ? '✓ Доставлен' : '🔄 В обработке'}
                </span>
            </div>
            <div class="order-date"><i class="fas fa-calendar-alt"></i> ${order.date}</div>
            <div class="order-items">
                ${order.items.map(item => `<div class="order-item"><span>${escapeHtml(item.name)} × ${item.quantity}</span><span>${(item.price * item.quantity).toLocaleString()} ₽</span></div>`).join('')}
            </div>
            <div class="order-total">💰 Итого: ${order.total.toLocaleString()} ₽</div>
            <button class="btn-small repeat-order" data-id="${order.id}"><i class="fas fa-redo"></i> Повторить заказ</button>
        `;
        ordersContainer.appendChild(orderDiv);
    });
    
    document.querySelectorAll('.repeat-order').forEach(btn => {
        btn.onclick = () => repeatOrder(parseInt(btn.dataset.id));
    });
}

function updateWishlistPage() {
    const wishlistContainer = document.getElementById('wishlistList');
    if (!wishlistContainer) return;
    
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<div class="empty-state"><i class="fas fa-heart-broken"></i><p>❤️ У вас пока нет избранных товаров</p><a href="catalog.html" class="btn-small">Перейти в каталог</a></div>';
        return;
    }
    
    wishlistContainer.innerHTML = '';
    wishlist.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'wishlist-item';
        itemDiv.innerHTML = `
            <div class="wishlist-icon"><i class="fas ${item.icon}"></i></div>
            <div class="wishlist-info">
                <h4>${escapeHtml(item.name)}</h4>
                <div class="wishlist-price">${item.price.toLocaleString()} ₽</div>
            </div>
            <div class="wishlist-actions">
                <button class="btn-small add-to-cart-wishlist" data-id="${item.id}" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-icon="${item.icon}"><i class="fas fa-shopping-cart"></i> В корзину</button>
                <button class="btn-icon remove-wishlist" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        wishlistContainer.appendChild(itemDiv);
    });
    
    document.querySelectorAll('.add-to-cart-wishlist').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            const icon = btn.dataset.icon;
            addToCart(id, name, price, icon);
        };
    });
    
    document.querySelectorAll('.remove-wishlist').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const item = wishlist.find(i => i.id === id);
            if (item) toggleWishlist(id, item.name, item.price, item.icon);
        };
    });
}

// ========== ПОИСК И СОРТИРОВКА (с debounce) ==========
let searchTimeout;

function initUnifiedSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchBar = searchInput.parentElement;
    if (searchBar && !searchBar.querySelector('.search-clear')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.cssText = 'position: absolute; right: 130px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-gray); cursor: pointer; display: none; font-size: 1rem;';
        clearBtn.onclick = () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            triggerSearch();
        };
        searchBar.style.position = 'relative';
        searchBar.appendChild(clearBtn);
        
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(triggerSearch, 300);
        });
    }
    
    function triggerSearch() {
        const query = searchInput.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
            const specs = product.querySelector('.product-specs')?.textContent.toLowerCase() || '';
            const matches = title.includes(query) || specs.includes(query);
            product.style.display = matches ? '' : 'none';
            if (matches) {
                product.style.opacity = '1';
            }
        });
    }
}

function initUnifiedSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    sortSelect.onchange = () => {
        const sortValue = sortSelect.value;
        const products = Array.from(document.querySelectorAll('.product-card:not([style*="display: none"])'));
        const container = document.querySelector('.product-grid');
        if (!container) return;
        
        products.sort((a, b) => {
            const priceA = parseInt(a.dataset.price);
            const priceB = parseInt(b.dataset.price);
            
            if (sortValue === 'price-asc') return priceA - priceB;
            if (sortValue === 'price-desc') return priceB - priceA;
            return 0;
        });
        
        products.forEach(product => {
            product.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            product.style.opacity = '0';
        });
        
        setTimeout(() => {
            products.forEach(product => container.appendChild(product));
            setTimeout(() => {
                products.forEach(product => {
                    product.style.opacity = '1';
                });
            }, 50);
        }, 150);
    };
}

function initUnifiedFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;
    
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
                let show = true;
                const price = parseInt(product.dataset.price);
                
                if (filter === 'under150') show = price < 15000;
                else if (filter === 'above150') show = price >= 15000;
                else if (filter === 'ssd') show = product.dataset.type === 'ssd';
                else if (filter === 'hdd') show = product.dataset.type === 'hdd';
                else if (filter !== 'all') show = product.dataset.category === filter;
                
                product.style.display = show ? '' : 'none';
                if (show) {
                    product.style.opacity = '0';
                    setTimeout(() => { product.style.opacity = '1'; }, 10);
                }
            });
        };
    });
}

// ========== КНОПКИ ТОВАРОВ ==========
function initProductButtons() {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            const icon = btn.dataset.icon;
            addToCart(id, name, price, icon);
            
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
            btn.style.background = '#00ff66';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 800);
        };
    });
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            const icon = btn.dataset.icon;
            toggleWishlist(id, name, price, icon);
            updateWishlistButtons();
        };
    });
    
    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            showReviewModal(id, name);
        };
    });
}

// ========== ФОРМЫ ==========
function initForms() {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.onsubmit = (e) => {
            e.preventDefault();
            showToast('✉️ Сообщение отправлено! Мы свяжемся с вами.');
            feedbackForm.reset();
        };
    }
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm && currentUser) {
        if (document.getElementById('fullName')) document.getElementById('fullName').value = currentUser.name || '';
        if (document.getElementById('userEmail')) document.getElementById('userEmail').value = currentUser.email || '';
        if (document.getElementById('userPhone')) document.getElementById('userPhone').value = currentUser.phone || '';
        
        profileForm.onsubmit = (e) => {
            e.preventDefault();
            if (currentUser) {
                currentUser.name = document.getElementById('fullName')?.value || currentUser.name;
                currentUser.phone = document.getElementById('userPhone')?.value || currentUser.phone;
                
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].name = currentUser.name;
                    users[userIndex].phone = currentUser.phone;
                }
                saveUserData();
            }
            showToast('💾 Данные сохранены!');
            updateUserMenu();
        };
    }
    
    const modal = document.getElementById('reviewModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        
        modal.querySelectorAll('.star-rating i').forEach((star, index) => {
            star.onclick = () => {
                modal.querySelectorAll('.star-rating i').forEach((s, i) => {
                    if (i <= index) s.classList.add('active');
                    else s.classList.remove('active');
                });
            };
        });
        
        const submitBtn = document.getElementById('submitReview');
        if (submitBtn) {
            submitBtn.onclick = () => {
                const productId = parseInt(modal.dataset.productId);
                const productName = modal.dataset.productName;
                const rating = modal.querySelectorAll('.star-rating i.active').length;
                const text = document.getElementById('reviewText')?.value;
                
                if (rating === 0) {
                    showToast('⭐ Поставьте оценку', true);
                    return;
                }
                if (!text?.trim()) {
                    showToast('✏️ Напишите отзыв', true);
                    return;
                }
                
                addReview(productId, productName, rating, text);
                modal.classList.remove('active');
                if (typeof loadReviews === 'function') loadReviews();
            };
        }
    }
}

// ========== ПРОФИЛЬ ТАБЫ ==========
function initProfileTabs() {
    const navBtns = document.querySelectorAll('.profile-nav-btn');
    const tabs = document.querySelectorAll('.profile-tab');
    
    navBtns.forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.tab;
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabs.forEach(tab => tab.classList.remove('active'));
            const activeTab = document.getElementById(`tab-${tabId}`);
            if (activeTab) activeTab.classList.add('active');
            
            if (tabId === 'orders') updateOrdersPage();
            if (tabId === 'wishlist') updateWishlistPage();
            
            window.location.hash = tabId;
        };
    });
    
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const btn = document.querySelector(`.profile-nav-btn[data-tab="${tabId}"]`);
        if (btn) btn.click();
    }
}

// ========== КАРТОЧКИ ТОВАРОВ ==========
function initCardLinks() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.classList.contains('btn-add-to-cart') || 
                e.target.closest('.btn-add-to-cart') ||
                e.target.classList.contains('wishlist-btn') ||
                e.target.closest('.wishlist-btn') ||
                e.target.classList.contains('review-btn') ||
                e.target.closest('.review-btn')) return;
            const id = card.dataset.id;
            if (id) window.location.href = `product.html?id=${id}`;
        };
    });
}

// ========== СТАТИСТИКА ==========
function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            if (target && !stat.dataset.animated) {
                stat.dataset.animated = 'true';
                let current = 0;
                const duration = 2000;
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = target / steps;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current).toLocaleString();
                    }
                }, stepTime);
            }
        });
    }
}

// ========== ПАРТНЕРЫ И СОЦСЕТИ ==========
function initPartnerLinks() {
    const socialLinks = {
        'vk': 'https://vk.com/club228347080',
        'telegram': 'https://t.me/goydapk',
        'youtube': 'https://www.youtube.com/@GoydaPK'
    };
    
    document.querySelectorAll('.social-icon').forEach(icon => {
        const iconClass = icon.querySelector('i')?.className;
        if (iconClass?.includes('fa-vk')) icon.href = socialLinks.vk;
        if (iconClass?.includes('fa-telegram')) icon.href = socialLinks.telegram;
        if (iconClass?.includes('fa-youtube')) icon.href = socialLinks.youtube;
        if (icon.href !== '#') icon.target = '_blank';
    });
    
    const partners = {
        'NVIDIA': 'https://www.nvidia.com/ru-ru/',
        'AMD': 'https://www.amd.com/ru',
        'Intel': 'https://www.intel.ru',
        'Kingston': 'https://www.kingston.com/ru',
        'Corsair': 'https://www.corsair.com/ru/ru',
        'Samsung': 'https://www.samsung.com/ru/'
    };
    
    document.querySelectorAll('.partner-link').forEach(link => {
        const name = link.textContent.trim();
        if (partners[name]) {
            link.href = partners[name];
            link.target = '_blank';
        }
    });
}

// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html') {
        return true;
    }
    
    const protectedPages = ['profile.html', 'cart.html'];
    
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        const redirectUrl = currentPage;
        showToast('🔐 Пожалуйста, войдите в аккаунт', true);
        window.location.href = `login.html?redirect=${redirectUrl}`;
        return false;
    }
    return true;
}

// ========== ДОБАВЛЕНИЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ ==========
function addUserMenuArea() {
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons && !document.querySelector('.user-menu-area')) {
        const userMenuArea = document.createElement('div');
        userMenuArea.className = 'user-menu-area';
        headerIcons.insertBefore(userMenuArea, headerIcons.firstChild);
        updateUserMenu();
    }
}

// ========== СЧЕТЧИК ПОСЕЩЕНИЙ ==========
let visitCount = parseInt(localStorage.getItem('visitCount')) || 0;
visitCount++;
localStorage.setItem('visitCount', visitCount);

function addVisitCounter() {
    const counter = document.createElement('div');
    counter.className = 'visit-counter';
    counter.innerHTML = `👁️ Посещений: ${visitCount}`;
    document.body.appendChild(counter);
}

// ========== ТЕМНАЯ/СВЕТЛАЯ ТЕМА ==========
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            showToast(isLight ? '☀️ Светлая тема' : '🌙 Тёмная тема', false, 1500);
        });
    }
}

// ========== МУЗЫКАЛЬНЫЙ ПЛЕЕР ==========
let audio = null;
let currentTrackIndex = 0;
const playlist = [
    { name: 'Neon Dreams', artist: 'Goyda Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: 'Cyber Pulse', artist: 'Synthwave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { name: 'Midnight Drive', artist: 'Retro Future', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

function initMusicPlayer() {
    const musicBtn = document.querySelector('.music-toggle');
    if (!musicBtn) return;
    
    musicBtn.addEventListener('click', () => {
        let player = document.querySelector('.music-player');
        if (player) {
            player.classList.toggle('active');
        } else {
            createMusicPlayer();
        }
    });
}

function createMusicPlayer() {
    const player = document.createElement('div');
    player.className = 'music-player';
    player.innerHTML = `
        <div class="music-player-cover">
            <i class="fas fa-headphones"></i>
        </div>
        <div class="music-player-info">
            <div class="music-player-track">${playlist[0].name}</div>
            <div class="music-player-artist">${playlist[0].artist}</div>
        </div>
        <audio id="musicAudio" src="${playlist[0].url}" loop></audio>
        <div class="music-player-controls">
            <button class="music-player-prev"><i class="fas fa-backward-step"></i></button>
            <button class="music-player-play"><i class="fas fa-play"></i></button>
            <button class="music-player-next"><i class="fas fa-forward-step"></i></button>
        </div>
        <input type="range" class="music-player-volume" min="0" max="1" step="0.01" value="0.3">
        <span class="music-player-time">00:00</span>
        <button class="music-player-close"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(player);
    
    const audioEl = player.querySelector('#musicAudio');
    const playBtn = player.querySelector('.music-player-play');
    const prevBtn = player.querySelector('.music-player-prev');
    const nextBtn = player.querySelector('.music-player-next');
    const volumeSlider = player.querySelector('.music-player-volume');
    const timeSpan = player.querySelector('.music-player-time');
    const closeBtn = player.querySelector('.music-player-close');
    const trackSpan = player.querySelector('.music-player-track');
    const artistSpan = player.querySelector('.music-player-artist');
    
    let isPlaying = false;
    audioEl.volume = 0.3;
    
    function loadTrack(index) {
        currentTrackIndex = (index + playlist.length) % playlist.length;
        const track = playlist[currentTrackIndex];
        audioEl.src = track.url;
        trackSpan.textContent = track.name;
        artistSpan.textContent = track.artist;
        if (isPlaying) {
            audioEl.play();
        }
    }
    
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioEl.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioEl.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    prevBtn.addEventListener('click', () => {
        loadTrack(currentTrackIndex - 1);
        if (!isPlaying) {
            audioEl.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        }
    });
    
    nextBtn.addEventListener('click', () => {
        loadTrack(currentTrackIndex + 1);
        if (!isPlaying) {
            audioEl.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        }
    });
    
    volumeSlider.addEventListener('input', () => {
        audioEl.volume = volumeSlider.value;
    });
    
    audioEl.addEventListener('timeupdate', () => {
        const minutes = Math.floor(audioEl.currentTime / 60);
        const seconds = Math.floor(audioEl.currentTime % 60);
        timeSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
    
    audioEl.addEventListener('ended', () => {
        loadTrack(currentTrackIndex + 1);
        audioEl.play();
    });
    
    closeBtn.addEventListener('click', () => {
        audioEl.pause();
        isPlaying = false;
        player.classList.remove('active');
        setTimeout(() => player.remove(), 300);
    });
    
    setTimeout(() => player.classList.add('active'), 100);
}

// ========== КАЛЬКУЛЯТОР СБОРКИ ПК ==========
function initPCBuilder() {
    const builderHTML = `
        <div class="pc-builder glass">
            <h3><i class="fas fa-computer"></i> Калькулятор сборки ПК</h3>
            <div class="budget-slider">
                <label>💰 Бюджет: <span class="budget-value">50 000 ₽</span></label>
                <input type="range" id="budgetRange" min="30000" max="200000" step="10000" value="50000">
            </div>
            <div id="builderResult" class="builder-result">
                <h4>🎮 Рекомендуемая сборка:</h4>
                <ul>
                    <li><span>Процессор:</span><span>AMD Ryzen 5 5600X</span></li>
                    <li><span>Видеокарта:</span><span>RTX 3060 12GB</span></li>
                    <li><span>ОЗУ:</span><span>Kingston Fury 16GB DDR4</span></li>
                    <li><span>SSD:</span><span>Samsung 980 1TB NVMe</span></li>
                    <li><span>Блок питания:</span><span>Corsair 650W 80+ Bronze</span></li>
                </ul>
                <p style="margin-top: 0.8rem; color: var(--neon-cyan);">💰 Общая стоимость: ~95 000 ₽</p>
            </div>
        </div>
    `;
    
    const profileContent = document.querySelector('.profile-content');
    if (profileContent && !document.querySelector('.pc-builder')) {
        const builderTab = document.getElementById('tab-builder');
        if (builderTab) {
            builderTab.innerHTML = builderHTML;
            initBudgetSlider();
        }
    }
    
    const profileNav = document.querySelector('.profile-nav');
    if (profileNav && !document.querySelector('.profile-nav-btn[data-tab="builder"]')) {
        const builderBtn = document.createElement('button');
        builderBtn.className = 'profile-nav-btn';
        builderBtn.setAttribute('data-tab', 'builder');
        builderBtn.innerHTML = '<i class="fas fa-computer"></i> Сборка ПК';
        profileNav.appendChild(builderBtn);
        
        const profileTabs = document.querySelector('.profile-content');
        const builderTab = document.createElement('div');
        builderTab.className = 'profile-tab';
        builderTab.id = 'tab-builder';
        profileTabs.appendChild(builderTab);
        
        builderBtn.addEventListener('click', () => {
            document.querySelectorAll('.profile-nav-btn').forEach(b => b.classList.remove('active'));
            builderBtn.classList.add('active');
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            builderTab.classList.add('active');
            builderTab.innerHTML = builderHTML;
            initBudgetSlider();
        });
    }
}

function initBudgetSlider() {
    const slider = document.getElementById('budgetRange');
    if (!slider) return;
    
    const budgetValue = document.querySelector('.budget-value');
    
    const builds = {
        low: {
            cpu: 'AMD Ryzen 5 5600X',
            gpu: 'RTX 3060 12GB',
            ram: 'Kingston Fury 16GB DDR4',
            ssd: 'Samsung 980 1TB NVMe',
            psu: 'Corsair 650W 80+ Bronze',
            total: 95000
        },
        medium: {
            cpu: 'Intel Core i5-13400',
            gpu: 'RTX 3060 12GB',
            ram: 'Corsair Vengeance 32GB DDR4',
            ssd: 'Samsung 980 1TB NVMe',
            psu: 'Corsair 650W 80+ Bronze',
            total: 105000
        },
        high: {
            cpu: 'Intel Core i5-13400',
            gpu: 'RTX 4070 12GB',
            ram: 'Corsair Vengeance 32GB DDR4',
            ssd: 'Samsung 980 1TB NVMe',
            psu: 'be quiet! 850W 80+ Gold',
            total: 145000
        }
    };
    
    function updateBuild(budget) {
        let build = builds.low;
        if (budget <= 50000) build = builds.low;
        else if (budget <= 100000) build = builds.medium;
        else build = builds.high;
        
        const resultDiv = document.getElementById('builderResult');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <h4>🎮 Рекомендуемая сборка:</h4>
                <ul>
                    <li><span>Процессор:</span><span>${build.cpu}</span></li>
                    <li><span>Видеокарта:</span><span>${build.gpu}</span></li>
                    <li><span>ОЗУ:</span><span>${build.ram}</span></li>
                    <li><span>SSD:</span><span>${build.ssd}</span></li>
                    <li><span>Блок питания:</span><span>${build.psu}</span></li>
                </ul>
                <p style="margin-top: 0.8rem; color: var(--neon-cyan);">💰 Общая стоимость: ~${build.total.toLocaleString()} ₽</p>
                <p style="font-size: 0.8rem; color: var(--text-gray); margin-top: 0.5rem;">*Цены могут отличаться, уточняйте в каталоге</p>
            `;
        }
    }
    
    slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        budgetValue.textContent = value.toLocaleString() + ' ₽';
        updateBuild(value);
    });
    
    updateBuild(50000);
}

// ========== АНИМАЦИЯ ПОЯВЛЕНИЯ ==========
function initScrollAnimation() {
    const elements = document.querySelectorAll('.product-card, .feature-card, .advantage-card, .category-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    elements.forEach(el => {
        if (!el.classList.contains('visible')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            observer.observe(el);
        }
    });
}

// ========== КАСТОМНЫЙ КУРСОР ==========
function initCustomCursor() {
    if (isMobile) return;
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(dot);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform += ' scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
        cursor.style.transform = cursor.style.transform.replace(' scale(0.8)', '');
    });
}

// ========== КНОПКА "НАВЕРХ" ==========
function initScrollTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== ИНДИКАТОР ПРОГРЕССА ==========
function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = 'position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink)); z-index: 1001; width: 0%; transition: width 0.1s ease;';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ========== ДОБАВЛЕНИЕ КНОПОК В ХЕДЕР ==========
function addHeaderActions() {
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons && !document.querySelector('.header-actions')) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'header-actions';
        actionsDiv.innerHTML = `
            <button class="theme-toggle"><i class="fas fa-moon"></i></button>
            <button class="music-toggle"><i class="fas fa-music"></i></button>
        `;
        headerIcons.insertBefore(actionsDiv, headerIcons.firstChild);
    }
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ========== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    addBackgroundElements();
    addUserMenuArea();
    addHeaderActions();
    addVisitCounter();
    initThemeToggle();
    initMusicPlayer();
    initPCBuilder();
    initScrollAnimation();
    initCustomCursor();
    initScrollTopButton();
    initProgressBar();
    
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html') {
        if (!checkAuth()) return;
    }
    
    updateCartPage();
    updateCartBadge();
    updateWishlistButtons();
    updateOrdersPage();
    updateWishlistPage();
    initProductButtons();
    initUnifiedFilters();
    initUnifiedSearch();
    initUnifiedSort();
    initProfileTabs();
    initForms();
    initCardLinks();
    initStats();
    initPartnerLinks();
    
    const checkoutBtn = document.querySelector('.btn-checkout-small');
    if (checkoutBtn) checkoutBtn.onclick = checkout;
});

// Экспорт глобальных функций
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.showToast = showToast;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getUserName = getUserName;
window.updateUserMenu = updateUserMenu;
window.repeatOrder = repeatOrder;
window.login = login;
window.register = register;
