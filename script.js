const PRODUCTS = [
  {
    id: 1,
    name: 'Aero Wireless Earbuds',
    category: 'Elektronik',
    price: 1290000,
    rating: 4.9,
    badge: 'Best Seller',
    description: 'Suara premium dengan noise cancelling untuk fokus dan hiburan.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'UltraFit Smartwatch',
    category: 'Elektronik',
    price: 1890000,
    rating: 4.8,
    badge: 'Baru',
    description: 'Pantau kesehatan, aktivitas, dan notifikasi dalam satu perangkat.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Urban Canvas Sneaker',
    category: 'Pakaian',
    price: 620000,
    rating: 4.7,
    badge: 'Trend',
    description: 'Sepatu kasual ringan dengan desain modern untuk aktivitas harian.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Classic Denim Jacket',
    category: 'Pakaian',
    price: 740000,
    rating: 4.6,
    badge: 'Pilihan',
    description: 'Jaket denim santai dengan potongan nyaman dan premium.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: 'Nova Leather Wallet',
    category: 'Aksesoris',
    price: 240000,
    rating: 4.8,
    badge: 'Premium',
    description: 'Dompet kulit elegan dengan kualitas bahan tahan lama.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: 'Orbit Sunglasses',
    category: 'Aksesoris',
    price: 390000,
    rating: 4.5,
    badge: 'Hot',
    description: 'Kacamata style premium dengan perlindungan UV yang optimal.',
    image: 'https://images.unsplash.com/photo-1577803947579-9f0dfe14efc4?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 7,
    name: 'Luma Desk Lamp',
    category: 'Elektronik',
    price: 510000,
    rating: 4.9,
    badge: 'Office',
    description: 'Lampu meja modern dengan pencahayaan lembut dan efisien.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 8,
    name: 'Horizon Backpack',
    category: 'Aksesoris',
    price: 560000,
    rating: 4.7,
    badge: 'Travel',
    description: 'Tas ransel nyaman untuk kebutuhan harian dan perjalanan singkat.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  }
];

const CART_KEY = 'miniShopCart';
const ORDER_KEY = 'miniShopLatestOrder';
const AUTH_KEY = 'miniShopAuth';
const WISHLIST_KEY = 'miniShopWishlist';
const ORDER_HISTORY_KEY = 'miniShopOrderHistory';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

function formatMoney(value) {
  return moneyFormatter.format(value);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getProductById(productId) {
  return PRODUCTS.find((product) => Number(product.id) === Number(productId));
}

function addToCart(productId) {
  const cart = getCart();
  const product = getProductById(productId);

  if (!product) return;

  const existingItem = cart.find((item) => Number(item.id) === Number(productId));

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  updateCartBadges();
  renderCartDrawer();
  showToast('Produk ditambahkan ke keranjang');
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => Number(entry.id) === Number(productId));

  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    const index = cart.findIndex((entry) => Number(entry.id) === Number(productId));
    cart.splice(index, 1);
  }

  saveCart(cart);
  updateCartBadges();
  renderCartDrawer();
  renderCartPage();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((entry) => Number(entry.id) !== Number(productId));
  saveCart(cart);
  updateCartBadges();
  renderCartDrawer();
  renderCartPage();
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadges() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const badgeNodes = document.querySelectorAll('[data-cart-count]');
  badgeNodes.forEach((node) => {
    node.textContent = totalItems;
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function renderCartDrawer() {
  const drawer = document.getElementById('cartItems');
  const totalNode = document.getElementById('cartTotal');

  if (!drawer || !totalNode) return;

  const cart = getCart();
  if (!cart.length) {
    drawer.innerHTML = '<div class="cart-empty">Keranjang masih kosong. Mulai pilih produk favoritmu.</div>';
    totalNode.textContent = formatMoney(0);
    return;
  }

  drawer.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-thumb">
            <img src="${item.image}" alt="${item.name}" />
          </div>
          <div class="cart-item-body">
            <h4>${item.name}</h4>
            <p>${item.category}</p>
            <div class="cart-item-footer">
              <div class="qty-box">
                <button class="qty-btn" type="button" data-cart-action="decrease" data-product-id="${item.id}">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" type="button" data-cart-action="increase" data-product-id="${item.id}">+</button>
              </div>
              <button class="cart-delete" type="button" data-cart-action="remove" data-product-id="${item.id}">🗑️</button>
            </div>
          </div>
          <div class="cart-price">${formatMoney(item.price * item.qty)}</div>
        </div>
      `
    )
    .join('');

  totalNode.textContent = formatMoney(getCartTotal());
}

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const searchInput = document.getElementById('searchInput');
  const selectedCategory = document.querySelector('.category-pill.active')?.dataset.category || 'all';
  const query = (searchInput?.value || '').trim().toLowerCase();

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesQuery = product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (!filteredProducts.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h2>Produk tidak ditemukan</h2>
        <p>Coba kata kunci lain atau ubah filter kategori.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.name}" />
            <span class="product-badge">${product.badge}</span>
          </div>
          <div class="product-content">
            <div class="product-topline">
              <span class="product-category">${product.category}</span>
              <span class="product-rating">★ ${product.rating}</span>
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-card-actions">
              <span class="product-price">${formatMoney(product.price)}</span>
              <div style="display:flex; gap:8px; align-items:center;">
                <button class="secondary-btn" type="button" data-wishlist-id="${product.id}" style="padding:9px 10px;">♡</button>
                <a href="detail.html?id=${product.id}" class="secondary-link">Detail</a>
              </div>
            </div>
            <button class="add-to-cart-btn" type="button" data-product-id="${product.id}">Tambah ke Keranjang</button>
          </div>
        </article>
      `
    )
    .join('');
}

function renderDetailPage() {
  const content = document.getElementById('detailContent');
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const product = PRODUCTS.find((item) => item.id === id);

  if (!product) {
    content.innerHTML = `
      <div class="empty-state">
        <h2>Produk tidak ditemukan</h2>
        <p>Produk yang Anda cari tidak tersedia saat ini.</p>
        <a href="index.html" class="primary-btn" style="display:inline-block;">Kembali ke katalog</a>
      </div>
    `;
    return;
  }

  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
  ];

  content.innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">
        <img id="detailMainImage" src="${galleryImages[0]}" alt="${product.name}" />
        <div class="detail-thumbs">
          ${galleryImages
            .map((img, index) => `
              <img class="${index === 0 ? 'active' : ''}" src="${img}" alt="${product.name} ${index + 1}" data-detail-thumb="${index}" />
            `)
            .join('')}
        </div>
      </div>

      <div class="detail-info">
        <span class="product-category">${product.category}</span>
        <h1>${product.name}</h1>
        <div class="detail-rating">★ ${product.rating} • 128 ulasan</div>
        <div class="detail-price">${formatMoney(product.price)}</div>
        <p class="detail-description">${product.description}</p>

        <div class="detail-actions">
          <button class="primary-btn" type="button" data-product-id="${product.id}">Tambah ke Keranjang</button>
          <button class="secondary-btn" type="button" data-wishlist-id="${product.id}">♡ Wishlist</button>
          <a href="index.html" class="secondary-btn" style="display:inline-flex; align-items:center; justify-content:center;">Kembali</a>
        </div>

        <ul class="detail-specs">
          <li>✔ Bahan premium dan tahan lama</li>
          <li>✔ Garansi resmi 1 tahun</li>
          <li>✔ Pengiriman cepat dan aman</li>
        </ul>
      </div>
    </div>
  `;

  initWishlistButtons();

  document.querySelectorAll('[data-detail-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('detailMainImage').src = thumb.src;
      document.querySelectorAll('[data-detail-thumb]').forEach((node) => node.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

function renderWishlistPreview() {
  const wishlistCount = document.getElementById('wishlistCount');
  if (wishlistCount) {
    wishlistCount.textContent = String(getWishlist().length);
  }
}

function toggleWishlist(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const wishlist = getWishlist();
  const index = wishlist.findIndex((item) => Number(item.id) === Number(productId));

  if (index >= 0) {
    wishlist.splice(index, 1);
    showToast('Produk dihapus dari wishlist');
  } else {
    wishlist.push(product);
    showToast('Produk ditambahkan ke wishlist');
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  renderWishlistPreview();
  initWishlistButtons();

  const currentPage = document.body.dataset.page;
  if (currentPage === 'profile') {
    renderProfilePage();
  }
  if (currentPage === 'home') {
    renderProductGrid();
  }
  if (currentPage === 'detail') {
    renderDetailPage();
  }
}

function initWishlistButtons() {
  document.querySelectorAll('[data-wishlist-id]').forEach((button) => {
    const productId = Number(button.dataset.wishlistId);
    const isSaved = getWishlist().some((item) => Number(item.id) === productId);
    button.classList.toggle('is-active', isSaved);
    button.textContent = isSaved ? '♥ Wishlist' : '♡ Wishlist';
    button.setAttribute('aria-pressed', String(isSaved));
    button.onclick = () => toggleWishlist(productId);
  });
}

function initHomePage() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartTrigger = document.getElementById('cartTrigger');
  const closeCart = document.getElementById('closeCart');
  const searchInput = document.getElementById('searchInput');
  const categoryButtons = document.querySelectorAll('.category-pill');

  renderProductGrid();
  renderCartDrawer();
  updateCartBadges();

  if (cartTrigger) {
    cartTrigger.addEventListener('click', () => {
      cartDrawer?.classList.add('open');
      cartOverlay?.classList.add('visible');
    });
  }

  if (closeCart) {
    closeCart.addEventListener('click', () => {
      cartDrawer?.classList.remove('open');
      cartOverlay?.classList.remove('visible');
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      cartDrawer?.classList.remove('open');
      cartOverlay.classList.remove('visible');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderProductGrid);
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      categoryButtons.forEach((node) => node.classList.remove('active'));
      button.classList.add('active');
      renderProductGrid();
    });
  });

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-product-id]');
    if (!addButton) return;

    const productId = addButton.dataset.productId;
    const action = addButton.dataset.cartAction;

    if (action === 'increase') {
      updateQty(productId, 1);
      return;
    }
    if (action === 'decrease') {
      updateQty(productId, -1);
      return;
    }
    if (action === 'remove') {
      removeFromCart(productId);
      return;
    }

    addToCart(productId);
  });

  const checkoutButton = document.getElementById('checkoutFromCart');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (!getCart().length) {
        showToast('Keranjang masih kosong');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  const shopNowBtn = document.getElementById('shopNowBtn');
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', () => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function renderCartPage() {
  const list = document.getElementById('cartPageList');
  const totalNode = document.getElementById('cartTotalPage');
  const totalFinalNode = document.getElementById('cartTotalPageTotal');
  const summaryContainer = document.getElementById('cartSummary');
  if (!list || !totalNode || !summaryContainer) return;

  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = `
      <div class="empty-state">
        <h2>Keranjang masih kosong</h2>
        <p>Belum ada produk yang Anda pilih. Ayo mulai berbelanja.</p>
        <button class="primary-btn" type="button" onclick="window.location.href='index.html'">Belanja Sekarang</button>
      </div>
    `;
    totalNode.textContent = formatMoney(0);
    if (totalFinalNode) totalFinalNode.textContent = formatMoney(25000);
    summaryContainer.style.display = 'none';
    return;
  }

  summaryContainer.style.display = 'block';
  list.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-page-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="page-item-info">
            <h3>${item.name}</h3>
            <p>${item.category}</p>
            <div class="qty-box" style="margin-top: 14px; display: inline-flex;">
              <button class="qty-btn" type="button" data-cart-action="decrease" data-product-id="${item.id}">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" type="button" data-cart-action="increase" data-product-id="${item.id}">+</button>
            </div>
          </div>
          <div class="page-item-controls">
            <div class="page-item-price">${formatMoney(item.price * item.qty)}</div>
            <button class="cart-delete" type="button" data-cart-action="remove" data-product-id="${item.id}" aria-label="Hapus item">🗑️</button>
          </div>
        </div>
      `
    )
    .join('');

  const subtotal = getCartTotal();
  const shipping = 25000;
  totalNode.textContent = formatMoney(subtotal);
  if (totalFinalNode) totalFinalNode.textContent = formatMoney(subtotal + shipping);
}

function initCartPage() {
  renderCartPage();
  updateCartBadges();

  document.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-cart-action]');
    if (!actionTarget) return;
    const productId = actionTarget.dataset.productId;
    const action = actionTarget.dataset.cartAction;

    if (action === 'increase') updateQty(productId, 1);
    if (action === 'decrease') updateQty(productId, -1);
    if (action === 'remove') removeFromCart(productId);
  });

  const checkoutButton = document.getElementById('goCheckout');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (!getCart().length) {
        showToast('Keranjang masih kosong');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
}

function initCheckoutPage() {
  const items = getCart();
  const list = document.getElementById('checkoutItems');
  const subtotalNode = document.getElementById('checkoutSubtotal');
  const totalNode = document.getElementById('checkoutTotal');
  const shippingNode = document.getElementById('checkoutShipping');
  const placeOrder = document.getElementById('placeOrder');

  if (!list || !subtotalNode || !totalNode || !shippingNode || !placeOrder) return;

  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><h2>Keranjang masih kosong</h2><p>Anda perlu menambahkan produk dulu sebelum checkout.</p><button class="primary-btn" type="button" onclick="window.location.href=`index.html`">Kembali ke Toko</button></div>';
    subtotalNode.textContent = formatMoney(0);
    shippingNode.textContent = formatMoney(0);
    totalNode.textContent = formatMoney(0);
    return;
  }

  const shipping = 25000;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shipping;

  list.innerHTML = items
    .map(
      (item) => `
        <div class="cart-page-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="page-item-info">
            <h3>${item.name}</h3>
            <p>Qty: ${item.qty} • ${item.category}</p>
          </div>
          <div class="page-item-price">${formatMoney(item.price * item.qty)}</div>
        </div>
      `
    )
    .join('');

  subtotalNode.textContent = formatMoney(subtotal);
  shippingNode.textContent = formatMoney(shipping);
  totalNode.textContent = formatMoney(total);

  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach((option) => {
    option.addEventListener('click', () => {
      paymentOptions.forEach((node) => node.classList.remove('active'));
      option.classList.add('active');
    });
  });

  placeOrder.addEventListener('click', () => {
    const customerName = document.getElementById('customerName')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const selectedPayment = document.querySelector('.payment-option.active')?.dataset.payment || 'Transfer Bank';

    if (!customerName || !address || !phone) {
      showToast('Isi semua data pengiriman dulu');
      return;
    }

    const order = {
      id: `INV-${Date.now()}`,
      customerName,
      address,
      phone,
      payment: selectedPayment,
      items,
      subtotal,
      shipping,
      total,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    saveOrderHistory(order);
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    updateCartBadges();
    showToast('Pesanan berhasil dibuat');
    setTimeout(() => {
      window.location.href = 'sukses.html';
    }, 800);
  });
}

function initSuccessPage() {
  const summary = document.getElementById('successSummary');
  const order = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null');

  if (!summary || !order) {
    summary.innerHTML = '<p>Pesanan tidak ditemukan.</p>';
    return;
  }

  summary.innerHTML = `
    <div class="order-summary-box">
      <strong>Nomor Pesanan</strong>
      <span>${order.id}</span>
    </div>
    <div class="order-summary-box">
      <strong>Nama Pemesan</strong>
      <span>${order.customerName}</span>
    </div>
    <div class="order-summary-box">
      <strong>Alamat</strong>
      <span>${order.address}</span>
    </div>
    <div class="order-summary-box">
      <strong>Metode Pembayaran</strong>
      <span>${order.payment}</span>
    </div>
    <div class="order-summary-box">
      <strong>Total</strong>
      <span>${formatMoney(order.total)}</span>
    </div>
  `;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function renderUserChip() {
  const userNameNode = document.getElementById('userName');
  const loginAction = document.getElementById('loginAction');
  const logoutBtn = document.getElementById('logoutBtn');
  const user = getCurrentUser();

  if (userNameNode) {
    userNameNode.textContent = user ? user.name.split(' ')[0] : 'Guest';
  }

  if (logoutBtn) {
    logoutBtn.style.display = user ? 'inline-flex' : 'none';
  }

  if (loginAction) {
    loginAction.style.display = user ? 'none' : 'inline-flex';
  }
}

function initAuthPage(type) {
  const form = document.getElementById(type === 'login' ? 'loginForm' : 'registerForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('fullName')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const confirmPassword = document.getElementById('confirmPassword')?.value?.trim();

    if (type === 'register') {
      if (!name || !email || !password || !confirmPassword) {
        showToast('Isi semua data terlebih dahulu');
        return;
      }

      if (password.length < 6) {
        showToast('Password minimal 6 karakter');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok');
        return;
      }

      const existing = JSON.parse(localStorage.getItem('miniShopUsers') || '[]');
      const duplicate = existing.find((user) => user.email.toLowerCase() === email.toLowerCase());
      if (duplicate) {
        showToast('Email sudah terdaftar');
        return;
      }

      existing.push({ name, email, password });
      localStorage.setItem('miniShopUsers', JSON.stringify(existing));
      setCurrentUser({ name, email });
      showToast('Akun berhasil dibuat');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
      return;
    }

    if (!email || !password) {
      showToast('Email dan password wajib diisi');
      return;
    }

    const users = JSON.parse(localStorage.getItem('miniShopUsers') || '[]');
    const foundUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

    if (!foundUser) {
      showToast('Email atau password salah');
      return;
    }

    setCurrentUser({ name: foundUser.name, email: foundUser.email });
    showToast('Login berhasil');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  });

  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const input = document.getElementById('password');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToWishlist(productId) {
  toggleWishlist(productId);
}

function getOrderHistory() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOrderHistory(order) {
  const history = getOrderHistory();
  history.unshift(order);
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function renderProfilePage() {
  const profileInfo = document.getElementById('profileInfo');
  const wishlistList = document.getElementById('wishlistList');
  const orderHistory = document.getElementById('orderHistory');

  const user = getCurrentUser();
  if (!user) {
    if (profileInfo) profileInfo.innerHTML = '<div class="summary-row"><span>Anda belum login</span><strong><a href="login.html">Login</a></strong></div>';
    if (wishlistList) wishlistList.innerHTML = '<div class="empty-state"><h2>Wishlist kosong</h2><p>Login untuk menyimpan produk favorit Anda.</p></div>';
    if (orderHistory) orderHistory.innerHTML = '<div class="empty-state"><h2>Belum ada pesanan</h2><p>Pesanan Anda akan muncul di sini setelah checkout.</p></div>';
    return;
  }

  if (profileInfo) {
    profileInfo.innerHTML = `
      <div class="summary-row"><span>Nama</span><strong>${user.name}</strong></div>
      <div class="summary-row"><span>Email</span><strong>${user.email}</strong></div>
      <div class="summary-row"><span>Status</span><strong>Aktif</strong></div>
    `;
  }

  const wishlist = getWishlist();
  if (wishlistList) {
    if (!wishlist.length) {
      wishlistList.innerHTML = '<div class="empty-state"><h2>Wishlist kosong</h2><p>Belum ada produk favorit.</p></div>';
    } else {
      wishlistList.innerHTML = wishlist.map((item) => `
        <div class="cart-page-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="page-item-info">
            <h3>${item.name}</h3>
            <p>${item.category}</p>
          </div>
          <div class="page-item-price">${formatMoney(item.price)}</div>
        </div>
      `).join('');
    }
  }

  const history = getOrderHistory();
  if (orderHistory) {
    if (!history.length) {
      orderHistory.innerHTML = '<div class="empty-state"><h2>Belum ada pesanan</h2><p>Pesanan Anda akan muncul di sini setelah checkout.</p></div>';
    } else {
      orderHistory.innerHTML = history.map((order) => `
        <div class="cart-page-item">
          <div class="page-item-info">
            <h3>${order.id}</h3>
            <p>${order.customerName} • ${order.payment}</p>
            <p>${new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
          </div>
          <div class="page-item-price">${formatMoney(order.total)}</div>
        </div>
      `).join('');
    }
  }
}

function initProfilePage() {
  renderProfilePage();
  renderUserChip();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
  renderUserChip();

  const page = document.body.dataset.page;

  if (page === 'home') {
    initHomePage();
  }

  if (page === 'cart') {
    initCartPage();
  }

  if (page === 'checkout') {
    initCheckoutPage();
  }

  if (page === 'success') {
    initSuccessPage();
  }

  if (page === 'detail') {
    initDetailPage();
  }

  if (page === 'login') {
    initAuthPage('login');
  }

  if (page === 'register') {
    initAuthPage('register');
  }

  if (page === 'profile') {
    initProfilePage();
  }

  const profileTrigger = document.getElementById('profileTrigger');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  const wishlistTrigger = document.getElementById('wishlistTrigger');
  if (wishlistTrigger) {
    wishlistTrigger.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  renderWishlistPreview();
  initWishlistButtons();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  const loginAction = document.getElementById('loginAction');
  if (loginAction) {
    loginAction.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
});
