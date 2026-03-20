document.addEventListener('DOMContentLoaded', function() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    updateCartPage();
  }

  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => {
      badge.textContent = totalItems;
    });
  }

  function addToCart(productId, name, price, icon, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        name: name,
        price: price,
        quantity: quantity,
        icon: icon
      });
    }
    saveCart();
    alert(`✅ ${name} добавлен в корзину!`);
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
  }

  function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveCart();
    }
  }

  function updateCartPage() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart" style="text-align: center; padding: 3rem;">
          <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #a0b5cc; margin-bottom: 1rem;"></i>
          <h3>Корзина пуста</h3>
          <p>Добавьте товары из каталога</p>
          <a href="catalog.html" class="btn btn-neon" style="margin-top: 1rem;">Перейти в каталог</a>
        </div>
      `;
      updateCartSummary();
      return;
    }
    
    cartContainer.innerHTML = '';
    let subtotal = 0;
    let itemsCount = 0;
    
    cart.forEach(item => {
      const total = item.price * item.quantity;
      subtotal += total;
      itemsCount += item.quantity;
      
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-cell product-cell" data-label="Товар">
          <i class="fas ${item.icon}"></i>
          <span>${item.name}</span>
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
          <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      cartContainer.appendChild(row);
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = cart.find(i => i.id === id);
        if (item && item.quantity > 1) {
          updateCartItemQuantity(id, item.quantity - 1);
        }
      });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = cart.find(i => i.id === id);
        if (item) {
          updateCartItemQuantity(id, item.quantity + 1);
        }
      });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', () => {
        const id = parseInt(input.dataset.id);
        let val = parseInt(input.value);
        if (isNaN(val) || val < 1) val = 1;
        updateCartItemQuantity(id, val);
      });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        removeFromCart(id);
        updateCartPage();
      });
    });
    
    updateCartSummary();
  }
  
  function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const subtotalElement = document.querySelector('.cart-subtotal');
    const totalElement = document.querySelector('.cart-total');
    const itemsCountElement = document.querySelector('.items-count');
    
    if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString() + ' ₽';
    if (totalElement) totalElement.textContent = subtotal.toLocaleString() + ' ₽';
    if (itemsCountElement) itemsCountElement.textContent = itemsCount;
  }


  function initButtons() {
    const buttons = document.querySelectorAll('.btn-add-to-cart');
    console.log('Найдено кнопок:', buttons.length);
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = parseInt(this.dataset.id);
        const name = this.dataset.name;
        const price = parseInt(this.dataset.price);
        const icon = this.dataset.icon;
        
        console.log('Добавляем:', name);
        addToCart(id, name, price, icon, 1);
        
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
        setTimeout(() => {
          this.innerHTML = originalText;
        }, 1000);
      });
    });
  }


  const checkoutBtn = document.querySelector('.btn-checkout-small');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Корзина пуста!');
      } else {
        alert('✅ Заказ оформлен!');
        cart = [];
        saveCart();
        updateCartPage();
      }
    });
  }

 
  initButtons();
  updateCartPage();
  updateCartBadge();
});