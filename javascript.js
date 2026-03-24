
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];


function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  updateCartPage();
}

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistPage();
  updateWishlistButtons();
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}


function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach(badge => badge.textContent = total);
}


function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


function addToCart(id, name, price, icon, quantity = 1) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, name, price, quantity, icon });
  }
  saveCart();
  showToast(`${name} добавлен в корзину!`);
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  cart = cart.filter(item => item.id !== id);
  saveCart();
  if (item) showToast(`${item.name} удалён из корзины`);
}

function updateQuantity(id, quantity) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart();
  }
}


function toggleWishlist(id, name, price, icon) {
  const existing = wishlist.find(item => item.id === id);
  if (existing) {
    wishlist = wishlist.filter(item => item.id !== id);
    showToast(`${name} удалён из избранного`);
  } else {
    wishlist.push({ id, name, price, icon });
    showToast(`${name} добавлен в избранное`);
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


function addReview(productId, productName, rating, text) {
  let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
  if (!reviews[productId]) {
    reviews[productId] = [];
  }
  reviews[productId].push({
    id: Date.now(),
    productName: productName,
    rating: rating,
    text: text,
    date: new Date().toLocaleDateString('ru-RU'),
    userName: JSON.parse(localStorage.getItem('profile'))?.name || 'Александр Петров'
  });
  localStorage.setItem('reviews', JSON.stringify(reviews));
  showToast('Отзыв добавлен! Спасибо!');
}

function showReviewModal(productId, productName) {
  const modal = document.getElementById('reviewModal');
  if (!modal) return;
  
  modal.classList.add('active');
  modal.dataset.productId = productId;
  modal.dataset.productName = productName;
  
  document.getElementById('reviewText').value = '';
  document.querySelectorAll('.star-rating i').forEach(star => {
    star.classList.remove('active');
  });
}


function checkout() {
  if (cart.length === 0) {
    showToast('Корзина пуста!');
    return;
  }
  
  const profile = JSON.parse(localStorage.getItem('profile')) || { name: 'Александр Петров' };
  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleDateString('ru-RU'),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: 'processing'
  };
  
  orders.unshift(newOrder);
  saveOrders();
  cart = [];
  saveCart();
  showToast('Заказ оформлен! Спасибо за покупку!');
  updateCartPage();
  updateOrdersPage();
}


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
        <span style="font-weight: 600;">${item.name}</span>
      </div>
      <div class="cart-cell price-cell" data-label="Цена">${item.price.toLocaleString()} ₽</div>
      <div class="cart-cell quantity-cell" data-label="Количество">
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-id="${item.id}">-</button>
          <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
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
      if (item) updateQuantity(id, item.quantity + 1);
    };
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.onchange = () => {
      const id = parseInt(input.dataset.id);
      let val = parseInt(input.value);
      if (isNaN(val) || val < 1) val = 1;
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
    ordersContainer.innerHTML = '<p style="text-align: center; color: var(--text-gray);">У вас пока нет заказов</p>';
    return;
  }
  
  ordersContainer.innerHTML = '';
  orders.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-card';
    orderDiv.innerHTML = `
      <div class="order-header">
        <span style="font-weight: 600;">Заказ № ${order.id}</span>
        <span class="order-status ${order.status === 'delivered' ? 'status-delivered' : 'status-processing'}">
          ${order.status === 'delivered' ? '✓ Доставлен' : '🔄 В обработке'}
        </span>
      </div>
      <div style="color: var(--text-gray); font-size: 0.8rem;">${order.date}</div>
      <div style="margin: 0.5rem 0;">
        ${order.items.map(item => `<div style="margin: 0.3rem 0;">${item.name} — ${item.quantity} шт (${(item.price * item.quantity).toLocaleString()} ₽)</div>`).join('')}
      </div>
      <div style="text-align: right; font-weight: 600;">Итого: ${order.total.toLocaleString()} ₽</div>
      <button class="btn-small repeat-order" data-id="${order.id}" style="margin-top: 0.5rem;">Повторить заказ</button>
    `;
    ordersContainer.appendChild(orderDiv);
  });
  
  document.querySelectorAll('.repeat-order').forEach(btn => {
    btn.onclick = () => {
      const orderId = parseInt(btn.dataset.id);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.items.forEach(item => {
          addToCart(item.id, item.name, item.price, item.icon, item.quantity);
        });
        showToast('Товары добавлены в корзину');
      }
    };
  });
}


function updateWishlistPage() {
  const wishlistContainer = document.getElementById('wishlistList');
  if (!wishlistContainer) return;
  
  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = '<p style="text-align: center; color: var(--text-gray);">У вас пока нет избранных товаров</p>';
    return;
  }
  
  wishlistContainer.innerHTML = '';
  wishlist.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item';
    itemDiv.innerHTML = `
      <i class="fas ${item.icon}" style="font-size: 2rem; color: var(--neon-cyan);"></i>
      <div class="wishlist-info">
        <h4>${item.name}</h4>
        <div class="product-price" style="font-size: 1rem;">${item.price.toLocaleString()} ₽</div>
      </div>
      <button class="btn-small add-to-cart-wishlist" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-icon="${item.icon}">В корзину</button>
      <button class="btn-icon remove-wishlist" data-id="${item.id}" style="color: #ff6b6b;"><i class="fas fa-trash"></i></button>
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
      setTimeout(() => btn.innerHTML = original, 1000);
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


function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');
  
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      
      products.forEach(product => {
        if (filter === 'all') {
          product.style.display = 'block';
        } else if (filter === 'under150') {
          const price = parseInt(product.dataset.price);
          product.style.display = price < 15000 ? 'block' : 'none';
        } else if (filter === 'above150') {
          const price = parseInt(product.dataset.price);
          product.style.display = price >= 15000 ? 'block' : 'none';
        }
      });
    };
  });
}


function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
      const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const specs = product.querySelector('.product-specs')?.textContent.toLowerCase() || '';
      
      if (title.includes(query) || specs.includes(query)) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  };
}


function initSort() {
  const sortSelect = document.getElementById('sortSelect');
  if (!sortSelect) return;
  
  sortSelect.onchange = () => {
    const sortValue = sortSelect.value;
    const products = Array.from(document.querySelectorAll('.product-card'));
    const grid = document.querySelector('.product-grid');
    
    products.sort((a, b) => {
      const priceA = parseInt(a.dataset.price);
      const priceB = parseInt(b.dataset.price);
      
      if (sortValue === 'price-asc') return priceA - priceB;
      if (sortValue === 'price-desc') return priceB - priceA;
      return 0;
    });
    
    products.forEach(product => grid.appendChild(product));
  };
}


function initCategories() {
  const categories = document.querySelectorAll('.category-card');
  const products = document.querySelectorAll('.product-card');
  
  categories.forEach(cat => {
    cat.onclick = () => {
      const category = cat.dataset.category;
      products.forEach(product => {
        if (product.dataset.category === category) {
          product.scrollIntoView({ behavior: 'smooth', block: 'center' });
          product.style.border = '2px solid var(--neon-pink)';
          setTimeout(() => product.style.border = '', 2000);
        }
      });
      showToast(`Показаны товары: ${cat.querySelector('h3')?.textContent || ''}`);
    };
  });
}


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
    };
  });
}


function initForms() {
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.onsubmit = (e) => {
      e.preventDefault();
      showToast('Сообщение отправлено! Мы свяжемся с вами.');
      feedbackForm.reset();
    };
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      const profile = {
        name: document.getElementById('fullName')?.value,
        email: document.getElementById('userEmail')?.value,
        phone: document.getElementById('userPhone')?.value,
        city: document.getElementById('userCity')?.value,
        address: document.getElementById('userAddress')?.value
      };
      localStorage.setItem('profile', JSON.stringify(profile));
      showToast('Данные сохранены!');
    };
  }
  
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.onsubmit = (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newPassword')?.value;
      const confirmPass = document.getElementById('confirmPassword')?.value;
      
      if (!newPass || !confirmPass) {
        showToast('Заполните все поля');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Пароли не совпадают');
        return;
      }
      showToast('Пароль успешно изменён!');
      passwordForm.reset();
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
        const text = document.getElementById('reviewText').value;
        
        if (rating === 0) {
          showToast('Поставьте оценку');
          return;
        }
        if (!text.trim()) {
          showToast('Напишите отзыв');
          return;
        }
        
        addReview(productId, productName, rating, text);
        modal.classList.remove('active');
      };
    }
  }
}


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


function initStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.target);
      if (target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 30);
      }
    });
  }
}


function initPartnerLinks() {
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


function initMap() {
  if (typeof ymaps !== 'undefined' && document.getElementById('map')) {
    ymaps.ready(() => {
      const map = new ymaps.Map('map', {
        center: [56.129, 40.407],
        zoom: 16,
        controls: ['zoomControl']
      });
      
      const placemark = new ymaps.Placemark([56.129, 40.407], {
        hintContent: 'GoydaPK',
        balloonContent: '<strong>GoydaPK</strong><br/>г. Владимир, ул. Строителей, д. 22'
      }, {
        preset: 'islands#redDotIcon',
        iconColor: '#ff44cc'
      });
      
      map.geoObjects.add(placemark);
    });
  }
}


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
  }, { threshold: 0.1 });
  
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  updateCartPage();
  updateCartBadge();
  updateWishlistButtons();
  updateOrdersPage();
  updateWishlistPage();
  initProductButtons();
  initFilters();
  initSearch();
  initSort();
  initCategories();
  initProfileTabs();
  initForms();
  initCardLinks();
  initStats();
  initPartnerLinks();
  initMap();
  initScrollAnimation();
  
  const checkoutBtn = document.querySelector('.btn-checkout-small');
  if (checkoutBtn) checkoutBtn.onclick = checkout;
});

window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.showToast = showToast;
