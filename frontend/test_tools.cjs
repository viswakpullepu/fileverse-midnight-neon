const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Create download directory
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);
  
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  const pdf1 = path.resolve('test1.pdf');
  const pdf2 = path.resolve('test2.pdf');

  try {
    // ---------------------------------------------------------
    // TEST: MERGE PDF
    // ---------------------------------------------------------
    console.log('Testing Merge PDF...');
    await page.goto('http://localhost:5173/convert/merge-pdf');
    await page.waitForSelector('input[type="file"]');
    
    // Upload files
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(pdf1, pdf2);
    
    // Click merge
    await page.waitForSelector('button.btn');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mergeBtn = btns.find(b => b.textContent.includes('Merge PDFs'));
      if(mergeBtn) mergeBtn.click();
    });
    
    // Wait for success message
    await page.waitForFunction(() => document.body.innerText.includes('PDFs Merged Successfully!'), { timeout: 10000 });
    console.log('Merge PDF processed successfully.');
    
    // ---------------------------------------------------------
    // TEST: ADD WATERMARK
    // ---------------------------------------------------------
    console.log('Testing Add Watermark...');
    await page.goto('http://localhost:5173/convert/add-watermark');
    await page.waitForSelector('input[type="file"]');
    
    const fileInput2 = await page.$('input[type="file"]');
    await fileInput2.uploadFile(pdf1);
    
    await page.waitForSelector('button.btn');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Add Watermark'));
      if(btn) btn.click();
    });
    
    await page.waitForFunction(() => document.body.innerText.includes('Watermark Added Successfully!'), { timeout: 10000 });
    console.log('Add Watermark processed successfully.');

    // ---------------------------------------------------------
    // TEST: SPLIT PDF
    // ---------------------------------------------------------
    console.log('Testing Split PDF...');
    await page.goto('http://localhost:5173/convert/split-pdf');
    await page.waitForSelector('input[type="file"]');
    
    const fileInput3 = await page.$('input[type="file"]');
    await fileInput3.uploadFile(pdf1);
    
    await page.waitForSelector('button.btn');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Split PDF'));
      if(btn) btn.click();
    });
    
    await page.waitForFunction(() => document.body.innerText.includes('PDF Split Successfully!'), { timeout: 10000 });
    console.log('Split PDF processed successfully.');

    // ---------------------------------------------------------
    // TEST: IMAGE TO PDF
    // ---------------------------------------------------------
    console.log('Creating dummy image for testing ImageToPDF...');
    const dummyImage = path.resolve('test_image.png');
    fs.writeFileSync(dummyImage, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')); // 1x1 red pixel PNG

    console.log('Testing Image To PDF...');
    await page.goto('http://localhost:5173/convert/image-to-pdf');
    await page.waitForSelector('input[type="file"]');
    
    const fileInput4 = await page.$('input[type="file"]');
    await fileInput4.uploadFile(dummyImage);
    
    await page.waitForSelector('button.btn');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Convert to PDF'));
      if(btn) btn.click();
    });
    
    await page.waitForFunction(() => document.body.innerText.includes('PDF Created Successfully!'), { timeout: 10000 });
    console.log('Image To PDF processed successfully.');

  } catch (err) {
    console.error('Testing encountered an error:', err);
  }

  await browser.close();
  console.log('Browser closed. Tests complete.');
})();
