// Sakura Sushi — Main Application Logic
(function() {
  'use strict';

  // ============================================
  // SECURITY UTILITIES
  // ============================================
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  // Client-side rate limit for order form
  const ORDER_RATE_LIMIT_KEY = 'sakura_last_order_ts';
  const ORDER_RATE_LIMIT_MS = 60000; // 60 seconds

  function checkOrderRateLimit() {
    const last = Number(localStorage.getItem(ORDER_RATE_LIMIT_KEY) || '0');
    const now = Date.now();
    if (now - last < ORDER_RATE_LIMIT_MS) {
      const remaining = Math.ceil((ORDER_RATE_LIMIT_MS - (now - last)) / 1000);
      return { allowed: false, remainingSeconds: remaining };
    }
    return { allowed: true };
  }

  function setOrderRateLimit() {
    localStorage.setItem(ORDER_RATE_LIMIT_KEY, Date.now().toString());
  }

  // ============================================
  // DATA
  // ============================================
  const menuData = {
    all: [
      { id: 1, category: 'nigiri', name: 'Саке нігірі', desc: 'Лосось, рис, васабі', price: 120, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: ['Популярне'] },
      { id: 2, category: 'nigiri', name: 'Магуро нігірі', desc: 'Тунець, рис, васабі', price: 140, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: [] },
      { id: 3, category: 'nigiri', name: 'Ебі нігірі', desc: 'Креветка, рис, васабі', price: 110, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&q=80', tags: [] },
      { id: 4, category: 'nigiri', name: 'Унагі нігірі', desc: 'Вугор, унагі соус, кунжут', price: 160, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: ['Преміум'] },
      { id: 5, category: 'rolls', name: 'Філадельфія', desc: 'Лосось, сир філадельфія, авокадо, ікратобіко', price: 280, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80', tags: ['Хіт'] },
      { id: 6, category: 'rolls', name: 'Каліфорнія', desc: 'Краб, авокадо, огірок, ікра масаго, кунжут', price: 250, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80', tags: ['Класика'] },
      { id: 7, category: 'rolls', name: 'Дракон', desc: 'Унагі, авокадо, огірок, унагі соус, кунжут', price: 320, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: ['Преміум'] },
      { id: 8, category: 'rolls', name: 'Веган рол', desc: 'Авокадо, огірок, печериці шітаке, марковна ікра', price: 220, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80', tags: ['Веган'] },
      { id: 9, category: 'rolls', name: 'Спайси тунець', desc: 'Тунець, спайси соус, огірок, ікра масаго', price: 290, img: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=400&h=300&fit=crop&q=80', tags: ['Гостре'] },
      { id: 10, category: 'rolls', name: 'Саке макі', desc: 'Лосось, рис, нори, кунжут', price: 180, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: [] },
      { id: 11, category: 'sashimi', name: 'Сашімі з лосося', desc: 'Свіжий лосось, соєвий соус, васабі, маринований імбир', price: 320, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', tags: ['Популярне'] },
      { id: 12, category: 'sashimi', name: 'Сашімі з тунеця', desc: 'Свіжий тунець, соєвий соус, васабі, маринований імбир', price: 380, img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=300&fit=crop&q=80', tags: ['Преміум'] },
      { id: 13, category: 'sashimi', name: 'Асорті сашімі', desc: 'Лосось, тунець, біла риба, креветка, октопус (12 шт)', price: 520, img: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=400&h=300&fit=crop&q=80', tags: ['Для двох'] },
      { id: 14, category: 'hot', name: 'Місо суп', desc: 'Класичний японський суп з місо, тофу, вакаме, цибуля', price: 90, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80', tags: [] },
      { id: 15, category: 'hot', name: 'Рамен тонкоцу', desc: 'Більйон свинячий (12 год), яйце ажітама, ніторі, бамбук', price: 280, img: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&q=80', tags: ['Хіт'] },
      { id: 18, category: 'drinks', name: 'Матча латте', desc: 'Преміальна матча, молоко, натуральний мед', price: 85, img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&q=80', tags: [] },
      { id: 19, category: 'drinks', name: 'Саке холодне', desc: 'Преміальне рисове вино "Дайсіці", 150 мл', price: 180, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop&q=80', tags: ['Алкоголь'] },
      { id: 21, category: 'drinks', name: 'Генмайча', desc: 'Зелений чай з обсмаженим рисом', price: 55, img: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=300&fit=crop&q=80', tags: [] },
    ],
    nigiri: [], rolls: [], sashimi: [], hot: [], drinks: []
  };

  // Populate category arrays
  menuData.all.forEach(item => {
    if (menuData[item.category]) menuData[item.category].push(item);
  });

  const reviewsData = [
    { id: 1, stars: 5, text: 'Найкращі суші в місті! Риба таке свіжа, що тане в роті. Філадельфія — просто космос. Замовляю щотижня, ніколи не розчаровувався.', author: 'Олександр К.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&q=80', date: '2 дні тому' },
    { id: 2, stars: 5, text: 'Доставка за 40 хвилин, усе гаряче, пакування якісне. Рамен тонкоцу — найкращий, що пробував за межами Японії. Рекомендую всім друзям!', author: 'Марія П.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face&q=80', date: '1 тиждень тому' },
    { id: 3, stars: 4, text: 'Чудовий сервіс, приємний інтер\'єр ресторану. Веган рол з печерицями шітаке — несподіванка, дуже смачно. Єдине — іноді довго чекати в години пік.', author: 'Дмитро Л.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&q=80', date: '2 тижні тому' },
    { id: 4, stars: 5, text: 'Замовляли на корпоратив — 30 сетів. Все привезли вчасно, оформлено красиво, всі залишилися задоволени. Особливо сподобався Дракон та асорті сашімі.', author: 'Анна С.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&q=80', date: '1 місяць тому' },
    { id: 5, stars: 5, text: 'Матча латте — найкращий в Києві. Правильна مرّة смак, не занадто солодкий. Приходжу саме за ним і саке макі. Атмосфера затишна, персонал уважний.', author: 'Сергій М.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face&q=80', date: '3 дні тому' },
    { id: 6, stars: 4, text: 'Смачно, але ціни вище середніх. Зате якість на висоті — риба справді ранкового улову. Гйодза хрусткі, соус ідеальний. Повернусь точно.', author: 'Олена В.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face&q=80', date: '5 днів тому' },
  ];

  // ============================================
  // STATE
  // ============================================
  let cart = JSON.parse(localStorage.getItem('sakura_cart')) || [];
  let activeCategory = 'all';
  let currentReview = 0;
  let reviewAutoplayTimer = null;

  // ============================================
  // DOM ELEMENTS (lazy getters)
  // ============================================
  const getEls = () => ({
    header: document.getElementById('header'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    loadProgress: document.getElementById('loadProgress'),
    menuTabs: document.getElementById('menuTabs'),
    menuPanel: document.getElementById('menuPanel'),
    cartPanel: document.getElementById('cartPanel'),
    cartBackdrop: document.getElementById('cartBackdrop'),
    cartClose: document.getElementById('cartClose'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    cartCheckout: document.getElementById('cartCheckout'),
    reviewsTrack: document.getElementById('reviewsTrack'),
    sliderDots: document.getElementById('sliderDots'),
    prevReview: document.getElementById('prevReview'),
    nextReview: document.getElementById('nextReview'),
    orderForm: document.getElementById('orderForm'),
    submitBtn: document.getElementById('submitBtn'),
    toastContainer: document.getElementById('toastContainer'),
    statValues: document.querySelectorAll('.stat-value'),
  });

  // ============================================
  // UTILITIES
  // ============================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatPrice(price) {
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', minimumFractionDigits: 0 }).format(price);
  }

  function debounce(fn, delay) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function throttle(fn, limit) {
    let inThrottle; return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
  }

  // ============================================
  // MENU — core functions (no DOM deps)
  // ============================================
  function getMenuItems(category) {
    return menuData[category] || menuData.all;
  }

  function renderMenu(category) {
    const els = getEls();
    if (!els.menuPanel) {
      console.warn('menuPanel not found');
      return;
    }

    const items = getMenuItems(category);
    console.log(`Rendering menu: ${category}, ${items.length} items`);

    els.menuPanel.innerHTML = items.map((item, index) => `
      <article class="menu-item" data-id="${item.id}" style="animation-delay: ${index * 50}ms" role="listitem">
        <div class="menu-item-image">
          <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" width="400" height="300">
        </div>
        <div class="menu-item-body">
          <div class="menu-item-header">
            <h3 class="menu-item-name">${escapeHtml(item.name)}</h3>
            <span class="menu-item-price">${formatPrice(item.price)}</span>
          </div>
          <p class="menu-item-desc">${escapeHtml(item.desc)}</p>
          <div class="menu-item-footer">
            <div class="menu-item-tags">
              ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <button class="add-btn" data-id="${item.id}" aria-label="Додати ${escapeHtml(item.name)} до кошика">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Staggered reveal
    requestAnimationFrame(() => {
      $$('.menu-item', els.menuPanel).forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 50);
      });
    });

    // Bind add buttons (delegation would be better, but this works)
    $$('.add-btn', els.menuPanel).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const item = menuData.all.find(i => i.id === id);
        if (item) addToCart(item);
      });
    });
  }

  function switchCategory(category) {
    activeCategory = category;
    const els = getEls();

    // Update tab buttons
    if (els.menuTabs) {
      $$('.tab-btn', els.menuTabs).forEach(btn => {
        const active = btn.dataset.category === category;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active);
      });
    }

    renderMenu(category);
  }

  // ============================================
  // CART
  // ============================================
  function saveCart() {
    localStorage.setItem('sakura_cart', JSON.stringify(cart));
  }

  function updateCartCount() {
    const els = getEls();
    if (!els.cartCount) return;
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    els.cartCount.textContent = count;
    els.cartCount.classList.toggle('visible', count > 0);
  }

  function renderCart() {
    const els = getEls();
    if (!els.cartItems) return;

    if (!cart.length) {
      els.cartItems.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
      if (els.cartCheckout) els.cartCheckout.disabled = true;
      if (els.cartTotal) els.cartTotal.textContent = formatPrice(0);
      return;
    }

    els.cartItems.innerHTML = cart.map(item => `
      <article class="cart-item" data-id="${item.id}" role="listitem">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" class="cart-item-image" loading="lazy" width="64" height="64">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="decrease" aria-label="Зменшити кількість ${escapeHtml(item.name)}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="increase" aria-label="Збільшити кількість ${escapeHtml(item.name)}">+</button>
          </div>
        </div>
        <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
      </article>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (els.cartTotal) els.cartTotal.textContent = formatPrice(total);
    if (els.cartCheckout) els.cartCheckout.disabled = false;

    // Bind qty buttons
    $$('.qty-btn', els.cartItems).forEach(btn => {
      btn.addEventListener('click', () => {
        const itemEl = btn.closest('.cart-item');
        const id = Number(itemEl.dataset.id);
        const action = btn.dataset.action;
        updateCartQty(id, action === 'increase' ? 1 : -1);
      });
    });
  }

  function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else cart.push({ ...item, qty: 1 });
    saveCart();
    updateCartCount();
    renderCart();
    showToast(`Додано: ${item.name}`, 'success');
    openCart();
  }

  function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
  }

  function openCart() {
    const els = getEls();
    if (!els.cartPanel) return;
    els.cartPanel.classList.add('open');
    els.cartPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (els.cartClose) els.cartClose.focus();
  }

  function closeCart() {
    const els = getEls();
    if (!els.cartPanel) return;
    els.cartPanel.classList.remove('open');
    els.cartPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ============================================
  // REVIEWS SLIDER
  // ============================================
  function renderReviews() {
    const els = getEls();
    if (!els.reviewsTrack || !els.sliderDots) return;

    els.reviewsTrack.innerHTML = reviewsData.map((review, index) => `
      <div class="review-card" data-index="${index}" role="tabpanel" aria-roledescription="slide" aria-label="Відгук ${index + 1} з ${reviewsData.length}">
        <div class="review-content">
          <div class="review-stars" aria-label="${review.stars} з 5 зірок">
            ${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}
          </div>
          <blockquote class="review-text">"${escapeHtml(review.text)}"</blockquote>
          <div class="review-author">
            <img src="${escapeHtml(review.avatar)}" alt="" class="review-avatar" loading="lazy" width="52" height="52">
            <div class="review-info">
              <h4>${escapeHtml(review.author)}</h4>
              <p>${escapeHtml(review.date)}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    els.sliderDots.innerHTML = reviewsData.map((_, i) => `
      <button class="slider-dot" role="tab" aria-label="Відгук ${i + 1}" aria-selected="${i === 0}" data-index="${i}"></button>
    `).join('');

    $$('.slider-dot', els.sliderDots).forEach(btn => {
      btn.addEventListener('click', () => goToReview(Number(btn.dataset.index)));
    });

    updateReviewSlider();
    startReviewAutoplay();
  }

  function updateReviewSlider() {
    const els = getEls();
    if (!els.reviewsTrack || !els.sliderDots) return;

    const translateX = -currentReview * 100;
    els.reviewsTrack.style.transform = `translateX(${translateX}%)`;

    $$('.review-card', els.reviewsTrack).forEach((card, i) => {
      card.classList.toggle('active', i === currentReview);
    });

    $$('.slider-dot', els.sliderDots).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentReview);
      dot.setAttribute('aria-selected', i === currentReview);
    });
  }

  function goToReview(index) {
    currentReview = (index + reviewsData.length) % reviewsData.length;
    updateReviewSlider();
    resetReviewAutoplay();
  }

  function nextReview() { goToReview(currentReview + 1); }
  function prevReview() { goToReview(currentReview - 1); }

  function startReviewAutoplay() {
    reviewAutoplayTimer = setInterval(nextReview, 6000);
  }

  function resetReviewAutoplay() {
    clearInterval(reviewAutoplayTimer);
    startReviewAutoplay();
  }

  function pauseReviewAutoplay() { clearInterval(reviewAutoplayTimer); }
  function resumeReviewAutoplay() { startReviewAutoplay(); }

  // ============================================
  // LOAD PROGRESS & HEADER SCROLL
  // ============================================
  function updateLoadProgress() {
    const els = getEls();
    if (!els.loadProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    els.loadProgress.style.transform = `scaleX(${progress})`;
  }

  const handleHeaderScroll = throttle(() => {
    const els = getEls();
    if (!els.header) return;
    if (window.scrollY > 20) els.header.classList.add('scrolled');
    else els.header.classList.remove('scrolled');
    updateLoadProgress();
  }, 50);

  // ============================================
  // PARALLAX HERO
  // ============================================
  const handleParallax = throttle(() => {
    const hero = $('.hero');
    if (!hero) return;
    const scrolled = window.scrollY;
    const heroImage = $('.hero-image', hero);
    const heroGradient = $('.hero-gradient', hero);
    if (heroImage) heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    if (heroGradient) heroGradient.style.opacity = Math.max(0, 1 - scrolled / 800);
  }, 16);

  // ============================================
  // MOBILE NAV
  // ============================================
  function toggleMobileNav() {
    const els = getEls();
    if (!els.navToggle || !els.navMenu) return;
    const expanded = els.navToggle.getAttribute('aria-expanded') === 'true';
    els.navToggle.setAttribute('aria-expanded', !expanded);
    els.navMenu.classList.toggle('open');
    document.body.style.overflow = expanded ? '' : 'hidden';
  }

  function closeMobileNav() {
    const els = getEls();
    if (!els.navToggle || !els.navMenu) return;
    els.navToggle.setAttribute('aria-expanded', 'false');
    els.navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  function animateCounters() {
    const els = getEls();
    if (!els.statValues?.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = Number(el.dataset.count);
          const duration = 2000;
          const start = performance.now();

          function update(currentTime) {
            const progress = Math.min((currentTime - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            const suffix = target >= 100 ? '+' : target === 48 ? ' хв' : target === 98 ? '%' : '';
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    els.statValues.forEach(el => observer.observe(el));
  }

  // ============================================
  // REVEAL ANIMATIONS
  // ============================================
  function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    $$('.reveal, .about-features li, .contact-method, .delivery-card, .menu-item, .review-card').forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('reveal');
        observer.observe(el);
      }
    });
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  function showToast(message, type = 'info') {
    const els = getEls();
    if (!els.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : type === 'error' ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
      </svg>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Закрити">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    els.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    $('.toast-close', toast).addEventListener('click', () => hideToast(toast));
    setTimeout(() => hideToast(toast), 4000);
  }

  function hideToast(toast) {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  // ============================================
  // FORM VALIDATION & SUBMIT
  // ============================================
  const validators = {
    name: value => value.trim().length >= 2 ? '' : "Ім'я занадто коротке",
    phone: value => /^\+38\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(value) ? '' : 'Введіть коректний номер (+38 XXX XXX XX XX)',
    address: value => value.trim().length >= 5 ? '' : 'Введіть адресу доставки',
    comment: () => '',
    website: value => value === '' ? '' : 'Спам виявлено',
  };

  function validateField(input) {
    const name = input.name;
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(input.value);
    const errorEl = document.getElementById(`${name}Error`);
    const isValid = error === '' && (input.name !== 'website' || input.value === '');

    input.classList.toggle('error', !isValid);
    if (errorEl) {
      errorEl.textContent = error;
      errorEl.style.display = error ? 'block' : 'none';
    }
    return isValid;
  }

  function validateForm(form) {
    const inputs = $$('input, textarea', form).filter(el => !el.closest('.honeypot'));
    let isValid = true;
    inputs.forEach(input => { if (!validateField(input)) isValid = false; });
    const honeypot = $('#website', form);
    if (honeypot && honeypot.value !== '') isValid = false;
    return isValid;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateForm(form)) {
      showToast('Будь ласка, виправте помилки у формі', 'error');
      return;
    }

    // Client-side rate limit
    const rateLimit = checkOrderRateLimit();
    if (!rateLimit.allowed) {
      showToast(`Забагато замовлень. Спробуйте через ${rateLimit.remainingSeconds} сек.`, 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnText.hidden = true;
    btnLoading.hidden = false;

    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderNumber = 'SAK-' + Date.now().toString(36).toUpperCase().slice(-6);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // NOTE: In production, send order to backend (Web3Forms, Netlify Functions, etc.)
    // Do NOT store orders in localStorage — it exposes other users' PII
    // const order = { ... };
    // localStorage.setItem('sakura_orders', JSON.stringify(...));

    // Set rate limit timestamp
    setOrderRateLimit();

    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    closeCart();

    form.reset();
    $$('.form-error', form).forEach(el => el.textContent = '');
    $$('input, textarea', form).forEach(el => el.classList.remove('error'));

    showOrderSuccess(orderNumber, data);

    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    btnText.hidden = false;
    btnLoading.hidden = true;

    showToast(`Замовлення #${orderNumber} оформлено! Ми зателефонуємо за ${escapeHtml(data.phone)}`, 'success');
  }

  function showOrderSuccess(orderNumber, data) {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'successTitle');
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-body">
          <div class="success-state">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 class="success-title" id="successTitle">Замовлення оформлено!</h3>
            <p class="success-desc">Дякуємо, <strong>${escapeHtml(data.name)}</strong>! Ваше замовлення прийнято.</p>
            <p class="success-desc">Номер замовлення: <span class="order-number">${escapeHtml(orderNumber)}</span></p>
            <p class="success-desc">Ми зв'яжемося з вами за <strong>${escapeHtml(data.phone)}</strong> для підтвердження.</p>
            ${data.address ? `<p class="success-desc">Доставка: <strong>${escapeHtml(data.address)}</strong></p>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-block" id="successClose">Гаразд</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
      modal.classList.remove('open');
      modal.addEventListener('transitionend', () => {
        modal.remove();
        document.body.style.overflow = '';
      }, { once: true });
    };

    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    modal.querySelector('#successClose').addEventListener('click', closeModal);
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const els = getEls();
        const headerHeight = els.header?.offsetHeight || 72;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        closeMobileNav();
        closeCart();
      }
    });
  }

  // ============================================
  // EVENT BINDING (with delegation)
  // ============================================
  function bindEvents() {
    // Header scroll + parallax
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    window.addEventListener('scroll', handleParallax, { passive: true });

    // Mobile nav
    const els = getEls();
    if (els.navToggle) els.navToggle.addEventListener('click', toggleMobileNav);
    $$('.nav-link', els.navMenu).forEach(link => link.addEventListener('click', closeMobileNav));

    // Cart
    if (els.cartBtn) els.cartBtn.addEventListener('click', openCart);
    if (els.cartClose) els.cartClose.addEventListener('click', closeCart);
    if (els.cartBackdrop) els.cartBackdrop.addEventListener('click', closeCart);
    if (els.cartCheckout) els.cartCheckout.addEventListener('click', () => {
      closeCart();
      const contactSection = $('#contact');
      if (contactSection) {
        const headerHeight = els.header?.offsetHeight || 72;
        const targetPos = contactSection.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        setTimeout(() => $('#name', contactSection)?.focus(), 500);
      }
    });

    // Menu tabs — DELEGATION (works even if tabs added later)
    if (els.menuTabs) {
      els.menuTabs.addEventListener('click', e => {
        const btn = e.target.closest('.tab-btn');
        if (btn && btn.dataset.category) {
          switchCategory(btn.dataset.category);
        }
      });
    }

    // Reviews slider
    if (els.prevReview) els.prevReview.addEventListener('click', prevReview);
    if (els.nextReview) els.nextReview.addEventListener('click', nextReview);

    const slider = $('#reviewsSlider');
    if (slider) {
      slider.addEventListener('mouseenter', pauseReviewAutoplay);
      slider.addEventListener('mouseleave', resumeReviewAutoplay);
      slider.addEventListener('focusin', pauseReviewAutoplay);
      slider.addEventListener('focusout', resumeReviewAutoplay);
    }

    // Keyboard for reviews
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') prevReview();
      if (e.key === 'ArrowRight') nextReview();
    });

    // Form validation
    if (els.orderForm) {
      $$('input, textarea', els.orderForm).forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) validateField(input);
        });
      });
      els.orderForm.addEventListener('submit', handleFormSubmit);
    }

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeCart(); closeMobileNav(); }
    });

    // Smooth scroll
    initSmoothScroll();
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    console.log('🍣 Sakura Sushi init started');

    // Initial renders
    renderMenu('all');
    renderReviews();
    renderCart();
    updateCartCount();

    // Animations
    animateCounters();
    initRevealAnimations();

    // Events
    bindEvents();

    // Turnstile (if site key provided) — REPLACE with real sitekey from cloudflare.com/turnstile
    if (window.turnstile && document.getElementById('turnstileContainer')) {
      window.turnstile.render('#turnstileContainer', {
        sitekey: 'REPLACE_WITH_YOUR_TURNSTILE_SITEKEY',
        theme: 'auto',
        callback: () => {},
      });
    }

    document.body.classList.add('loaded');
    console.log('✅ Sakura Sushi initialized');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();