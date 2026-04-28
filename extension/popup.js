const APP_URL = 'https://kartfinder.app'; // Change to your actual domain

const SUPPORTED_HOSTS = ['amazon.in', 'amazon.com', 'flipkart.com', 'meesho.com'];

function show(id) {
  ['loadingScreen','authScreen','notProductScreen','productScreen','savedScreen']
    .forEach(s => document.getElementById(s).style.display = s === id ? 'block' : 'none');
}

function getStorage(keys) {
  return new Promise(res => chrome.storage.local.get(keys, res));
}
function setStorage(obj) {
  return new Promise(res => chrome.storage.local.set(obj, res));
}

async function getSession() {
  const data = await getStorage(['access_token', 'user_email']);
  return data.access_token ? data : null;
}

async function init() {
  show('loadingScreen');

  // Check current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isSupported = SUPPORTED_HOSTS.some(h => url.includes(h));

  const session = await getSession();

  if (!session) { show('authScreen'); setupAuth(); return; }

  if (!isSupported) { show('notProductScreen'); return; }

  document.getElementById('userEmail').textContent = session.user_email || '';
  document.getElementById('signoutBtn').addEventListener('click', signOut);

  // Get product data from content script
  let product = null;
  try {
    product = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT' });
  } catch {
    show('notProductScreen');
    return;
  }

  if (!product?.name) { show('notProductScreen'); return; }

  // Populate product UI
  const imgWrap = document.getElementById('productImgWrap');
  if (product.imageUrl) {
    imgWrap.innerHTML = `<img class="product-img" src="${product.imageUrl}" alt="" />`;
  } else {
    const emoji = { amazon: '📦', flipkart: '🛒', meesho: '🎀', other: '🏪' }[product.platform] || '🏪';
    imgWrap.innerHTML = `<div class="product-img-placeholder">${emoji}</div>`;
  }

  document.getElementById('productName').textContent = product.name.slice(0, 80);

  const badge = document.getElementById('platformBadge');
  badge.textContent = { amazon: 'Amazon', flipkart: 'Flipkart', meesho: 'Meesho', other: 'Other' }[product.platform];
  badge.className = `badge badge-${product.platform}`;

  if (product.price > 0) {
    document.getElementById('productPrice').textContent = `₹${product.price.toLocaleString('en-IN')}`;
  } else {
    document.getElementById('productPrice').textContent = 'Price not detected';
  }

  if (product.originalPrice > product.price && product.price > 0) {
    document.getElementById('productOrigPrice').textContent = `₹${product.originalPrice.toLocaleString('en-IN')}`;
    const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    document.getElementById('productDiscount').textContent = `${pct}% off`;
  }

  // Load wishlists
  await loadWishlists(session.access_token);

  // Save button
  document.getElementById('saveBtn').addEventListener('click', () => saveProduct(session, product));

  show('productScreen');
}

async function loadWishlists(token) {
  try {
    const res = await fetch(`${APP_URL}/api/extension/wishlists`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const wishlists = await res.json();
    const sel = document.getElementById('wishlistSelect');
    sel.innerHTML = wishlists.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    if (!wishlists.length) {
      sel.innerHTML = '<option value="">Default wishlist</option>';
    }
  } catch {
    document.getElementById('wishlistSelect').innerHTML = '<option value="">Default wishlist</option>';
  }
}

async function saveProduct(session, product) {
  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  document.getElementById('saveError').textContent = '';

  const wishlistId = document.getElementById('wishlistSelect').value;
  const priceOverride = parseFloat(document.getElementById('priceOverride').value);

  try {
    const res = await fetch(`${APP_URL}/api/extension/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        name: product.name,
        price: priceOverride || product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        url: product.url,
        platform: product.platform,
        wishlistId: wishlistId || undefined,
      })
    });

    if (!res.ok) throw new Error('Failed to save');

    const wishlistName = document.getElementById('wishlistSelect').selectedOptions[0]?.text || 'your wishlist';
    document.getElementById('savedTo').textContent = `Saved to "${wishlistName}"`;
    show('savedScreen');
  } catch (err) {
    document.getElementById('saveError').textContent = 'Failed to save. Try again.';
    btn.disabled = false;
    btn.textContent = 'Save to Kart Finder';
  }
}

function setupAuth() {
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const errEl = document.getElementById('authError');
    errEl.textContent = '';

    if (!email || !password) { errEl.textContent = 'Enter email and password'; return; }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const res = await fetch(`https://YOUR_SUPABASE_URL.supabase.co/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: 'YOUR_SUPABASE_ANON_KEY' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) throw new Error(data.error_description || 'Login failed');

      await setStorage({ access_token: data.access_token, user_email: email });
      init();
    } catch (err) {
      errEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
}

async function signOut() {
  await setStorage({ access_token: null, user_email: null });
  show('authScreen');
  setupAuth();
}

// Extension wishlists API
// We also need a GET endpoint — add this note for developer
// GET /api/extension/wishlists returns user's wishlists

init();
