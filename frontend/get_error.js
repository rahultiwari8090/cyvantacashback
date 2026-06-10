import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Listen to all console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
    
    // Check if vite error overlay exists
    const errorText = await page.evaluate(() => {
      const overlay = document.querySelector('vite-error-overlay');
      if (overlay && overlay.shadowRoot) {
        return overlay.shadowRoot.querySelector('.message-body')?.innerText;
      }
      return null;
    });
    
    if (errorText) {
      console.log('VITE ERROR OVERLAY:', errorText);
    } else {
      console.log('NO VITE OVERLAY. Page HTML:', await page.content());
    }
  } catch(e) {
    console.error(e);
  }
  await browser.close();
})();
