const puppeteer = require('puppeteer'); 
(async () => { 
  try { 
    const browser = await puppeteer.launch({ headless: 'new' }); 
    const page = await browser.newPage(); 
    await page.goto('http://localhost:5173'); 
    await page.type('input[type="text"]', 'admin'); 
    await page.type('input[type="password"]', 'password123'); 
    await page.click('button[type="submit"]'); 
    await page.waitForNavigation(); 
    console.log('Logged in'); 
    // Just directly go to subjects or wait for it
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: 'C:/Users/N Concept World/.gemini/antigravity-ide/brain/08437cd8-3c0c-469a-983b-1c81f000737d/puppeteer_dashboard.png'});
    
    // Evaluate in page to click the subjects tab
    await page.evaluate(() => {
       const academicsTab = Array.from(document.querySelectorAll('.sidebar-item')).find(el => el.textContent.includes('Academics'));
       if (academicsTab) academicsTab.click();
    });
    console.log('Clicked academics'); 
    await new Promise(r => setTimeout(r, 1000)); 
    
    await page.evaluate(() => {
       const subjectsTab = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.includes('Subjects'));
       if (subjectsTab) subjectsTab.click();
    });
    console.log('Clicked subjects'); 
    await new Promise(r => setTimeout(r, 2000)); 
    
    await page.screenshot({path: 'C:/Users/N Concept World/.gemini/antigravity-ide/brain/08437cd8-3c0c-469a-983b-1c81f000737d/puppeteer_subjects.png'}); 
    
    const deleteButtons = await page.$$('.btn-danger'); 
    if (deleteButtons.length > 0) { 
      console.log('Found delete buttons:', deleteButtons.length); 
      page.on('dialog', async dialog => { 
        console.log('Dialog:', dialog.message()); 
        await dialog.accept(); 
      }); 
      await deleteButtons[0].click(); 
      await new Promise(r => setTimeout(r, 3000)); 
      await page.screenshot({path: 'C:/Users/N Concept World/.gemini/antigravity-ide/brain/08437cd8-3c0c-469a-983b-1c81f000737d/puppeteer_after_delete.png'}); 
    } else { 
      console.log('No delete buttons found!'); 
    } 
    await browser.close(); 
  } catch(e) { 
    console.error(e); 
  } 
})();
