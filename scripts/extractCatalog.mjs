import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');
const mongoose = require('mongoose');

// Manual .env.local parsing
function loadEnv() {
    const envPath = './.env.local';
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            process.env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        }
    });
}
loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const pdfPath = './public/uploads/catalogs/1767692554142-catalog_2026_2.pdf';

async function run() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }
  
  // 1. Text extraction
  console.log("Extracting text from PDF catalog...");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ 
    data,
    useSystemFonts: true,
    disableFontFace: true
  });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
    if (i % 5 === 0 || i === pdf.numPages) {
        console.log(`Progress: ${i}/${pdf.numPages} pages`);
    }
  }

  // 2. Save to MongoDB
  const textSizeKB = (fullText.length / 1024).toFixed(1);
  console.log(`Extracted text size: ${textSizeKB} KB`);

  // Limit content for DB and SEO efficiency (50k chars is plenty for Google)
  const textToSave = fullText.slice(0, 50000);
  if (fullText.length > 50000) {
    console.log(`⚠️ Text truncated from ${fullText.length} to 50,000 characters.`);
  }

  console.log("Saving extracted text to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  await mongoose.connection.collection('settings').updateOne(
    {},
    { $set: { catalogExtractedText: textToSave } },
    { upsert: true }
  );
  
  console.log(`✅ Done! ${pdf.numPages} pages extracted and saved to DB.`);
  process.exit(0);
}

run().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
