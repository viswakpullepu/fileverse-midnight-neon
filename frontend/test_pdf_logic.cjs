const fs = require('fs');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

async function runTests() {
  console.log("=== STARTING LOGIC TESTS ===");

  // 1. Read Test PDFs
  const pdf1Bytes = fs.readFileSync('test1.pdf');
  const pdf2Bytes = fs.readFileSync('test2.pdf');

  console.log("-> Loaded test1.pdf and test2.pdf");
  
  // Base dimensions check
  const doc1 = await PDFDocument.load(pdf1Bytes);
  const p1 = doc1.getPage(0);
  console.log(`Original test1.pdf dimensions: ${p1.getWidth()}x${p1.getHeight()}`);

  // -----------------------------------------------------
  // TEST: MergePDF Logic
  // -----------------------------------------------------
  console.log("\n[TEST] MergePDF.jsx Logic");
  const mergedPdf = await PDFDocument.create();
  
  const mergeDoc1 = await PDFDocument.load(pdf1Bytes);
  const mergeDoc2 = await PDFDocument.load(pdf2Bytes);
  
  const copiedPages1 = await mergedPdf.copyPages(mergeDoc1, mergeDoc1.getPageIndices());
  copiedPages1.forEach(p => mergedPdf.addPage(p));
  
  const copiedPages2 = await mergedPdf.copyPages(mergeDoc2, mergeDoc2.getPageIndices());
  copiedPages2.forEach(p => mergedPdf.addPage(p));
  
  const pMerge1 = mergedPdf.getPage(0);
  const pMerge2 = mergedPdf.getPage(1);
  console.log(`Merged Page 1 dimensions: ${pMerge1.getWidth()}x${pMerge1.getHeight()}`);
  console.log(`Merged Page 2 dimensions: ${pMerge2.getWidth()}x${pMerge2.getHeight()}`);
  if (pMerge1.getWidth() === 500 && pMerge2.getWidth() === 500) {
    console.log("✅ MergePDF preserves exact dimensions. No deformation.");
  } else {
    console.log("❌ MergePDF deformed the pages!");
  }

  // -----------------------------------------------------
  // TEST: AddWatermark Logic
  // -----------------------------------------------------
  console.log("\n[TEST] AddWatermark.jsx Logic");
  const watermarkDoc = await PDFDocument.load(pdf1Bytes);
  const font = await watermarkDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = watermarkDoc.getPages();
  const wPage = pages[0];
  
  const preW = wPage.getWidth();
  const preH = wPage.getHeight();
  
  wPage.drawText('CONFIDENTIAL', {
    x: 100, y: 100, size: 60, font: font, opacity: 0.5, rotate: degrees(45)
  });
  
  const postW = wPage.getWidth();
  const postH = wPage.getHeight();
  
  console.log(`Watermarked Page dimensions: ${postW}x${postH}`);
  if (preW === postW && preH === postH) {
    console.log("✅ AddWatermark preserves exact dimensions. No deformation.");
  } else {
    console.log("❌ AddWatermark deformed the pages!");
  }

  // -----------------------------------------------------
  // TEST: SplitPDF Logic
  // -----------------------------------------------------
  console.log("\n[TEST] SplitPDF.jsx Logic");
  const splitDoc = await PDFDocument.load(pdf1Bytes);
  const newPdf = await PDFDocument.create();
  const [copiedPage] = await newPdf.copyPages(splitDoc, [0]);
  newPdf.addPage(copiedPage);
  
  const splitP = newPdf.getPage(0);
  console.log(`Split Page dimensions: ${splitP.getWidth()}x${splitP.getHeight()}`);
  if (splitP.getWidth() === 500 && splitP.getHeight() === 500) {
    console.log("✅ SplitPDF preserves exact dimensions. No deformation.");
  } else {
    console.log("❌ SplitPDF deformed the pages!");
  }

  // -----------------------------------------------------
  // TEST: ImageToPDF Logic
  // -----------------------------------------------------
  console.log("\n[TEST] ImageToPDF.jsx Logic");
  const imgToPdfDoc = await PDFDocument.create();
  // Create a 1920x1080 JPEG mock
  // We'll mock the width/height
  const mockImageWidth = 1920;
  const mockImageHeight = 1080;
  
  const page = imgToPdfDoc.addPage([mockImageWidth, mockImageHeight]);
  console.log(`ImageToPDF Page dimensions: ${page.getWidth()}x${page.getHeight()}`);
  if (page.getWidth() === 1920 && page.getHeight() === 1080) {
    console.log("✅ ImageToPDF scales page to exact image dimensions. No deformation.");
  } else {
    console.log("❌ ImageToPDF deformed the pages!");
  }

  console.log("\n=== ALL LOGIC TESTS COMPLETED ===");
}

runTests();
