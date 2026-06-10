const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  try {
    await page.goto('http://localhost:5174/store/1', { waitUntil: 'networkidle' });
    const errorText = await page.evaluate(() => {
      const overlay = document.querySelector('vite-error-overlay');
      if (overlay && overlay.shadowRoot) {
        return overlay.shadowRoot.querySelector('.message-body')?.innerText;
      }
      return null;
    });
    if (errorText) console.log('VITE ERROR OVERLAY:', errorText);
    else {
      console.log('NO VITE OVERLAY. Body text:', await page.locator('body').innerText());
      const rootHtml = await page.locator('#root').innerHTML();
      console.log('Root HTML:', rootHtml.substring(0, 500));
    }
  } catch(e) { console.error(e); }
  await browser.close();
})();
