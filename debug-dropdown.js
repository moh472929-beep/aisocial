const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/dashboard.html');
  
  // Wait longer for all scripts to load
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check if elements exist and event listeners
  const debugInfo = await page.evaluate(() => {
    const selector = document.querySelector('.selected-language');
    const dropdown = document.querySelector('.language-dropdown');
    
    // Check if the language switcher script has loaded
    const scriptLoaded = typeof initializeLanguageSystem === 'function';
    
    // Check if DOM content loaded event has fired
    const domReady = document.readyState === 'complete';
    
    return {
      selectorExists: !!selector,
      dropdownExists: !!dropdown,
      scriptLoaded: scriptLoaded,
      domReady: domReady,
      initialDisplay: dropdown ? window.getComputedStyle(dropdown).display : null
    };
  });
  
  console.log('Debug info:', debugInfo);
  
  if (debugInfo.selectorExists && debugInfo.dropdownExists) {
    console.log('Clicking language selector to test original event listener...');
    await page.click('.selected-language');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check after click
    const afterClick = await page.evaluate(() => {
      const dropdown = document.querySelector('.language-dropdown');
      return {
        inline: dropdown.style.display,
        computed: window.getComputedStyle(dropdown).display
      };
    });
    console.log('After click:', afterClick);
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();
})();