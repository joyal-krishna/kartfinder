// Content script: runs on Amazon, Flipkart, Meesho pages
// Extracts product data and sends to popup via chrome.runtime messaging

function detectPlatform() {
  const host = location.hostname;
  if (host.includes('amazon')) return 'amazon';
  if (host.includes('flipkart')) return 'flipkart';
  if (host.includes('meesho')) return 'meesho';
  return 'other';
}

function extractAmazon() {
  const name = document.getElementById('productTitle')?.textContent?.trim()
    || document.querySelector('.product-title-word-break')?.textContent?.trim();

  const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '');
  const priceFrac = document.querySelector('.a-price-fraction')?.textContent?.replace(/[^\d]/g, '') || '0';
  const price = priceWhole ? parseFloat(`${priceWhole}.${priceFrac}`) : 0;

  const originalPriceEl = document.querySelector('.a-text-price .a-offscreen') 
    || document.querySelector('#priceblock_ourprice');
  const originalPrice = originalPriceEl
    ? parseFloat(originalPriceEl.textContent?.replace(/[^\d.]/g, '') || '0')
    : price;

  const image = document.getElementById('landingImage')?.getAttribute('src')
    || document.getElementById('imgBlkFront')?.getAttribute('src')
    || document.querySelector('#main-image-container img')?.getAttribute('src')
    || '';

  return { name, price, originalPrice, image };
}

function extractFlipkart() {
  const name = document.querySelector('.B_NuCI')?.textContent?.trim()
    || document.querySelector('h1[class*="product"]')?.textContent?.trim()
    || document.querySelector('h1')?.textContent?.trim();

  const priceEl = document.querySelector('._30jeq3._16Jk6d') 
    || document.querySelector('._30jeq3')
    || document.querySelector('[class*="price"]');
  const price = priceEl 
    ? parseFloat(priceEl.textContent?.replace(/[^\d.]/g, '') || '0') 
    : 0;

  const origEl = document.querySelector('._3I9_wc._2p6lqe')
    || document.querySelector('._3I9_wc');
  const originalPrice = origEl
    ? parseFloat(origEl.textContent?.replace(/[^\d.]/g, '') || '0')
    : price;

  const image = document.querySelector('._396cs4._2amPTt._3qGmMb img')?.getAttribute('src')
    || document.querySelector('img[class*="product"]')?.getAttribute('src')
    || '';

  return { name, price, originalPrice, image };
}

function extractMeesho() {
  const name = document.querySelector('h1')?.textContent?.trim()
    || document.querySelector('[class*="ProductTitle"]')?.textContent?.trim();

  const priceEl = document.querySelector('[class*="price"]') 
    || document.querySelector('h4');
  const price = priceEl
    ? parseFloat(priceEl.textContent?.replace(/[^\d.]/g, '') || '0')
    : 0;

  const image = document.querySelector('img[class*="product"]')?.getAttribute('src')
    || document.querySelector('img[class*="Product"]')?.getAttribute('src')
    || '';

  return { name, price, originalPrice: price, image };
}

function extractProduct() {
  const platform = detectPlatform();
  let data = { name: '', price: 0, originalPrice: 0, image: '' };

  if (platform === 'amazon') data = extractAmazon();
  else if (platform === 'flipkart') data = extractFlipkart();
  else if (platform === 'meesho') data = extractMeesho();

  return {
    platform,
    name: data.name || document.title.split('|')[0].split(':')[0].trim().slice(0, 100),
    price: data.price || 0,
    originalPrice: data.originalPrice || data.price || 0,
    imageUrl: data.image || '',
    url: location.href,
  };
}

// Listen for popup requesting product data
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_PRODUCT') {
    sendResponse(extractProduct());
  }
  return true;
});
