const { PDFParse } = require('pdf-parse');
const path = require('path');
const fs = require('fs');

async function run() {
  try {
    PDFParse.setWorker(path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs"));
    const data = fs.readFileSync('sample.pdf');
    const parser = new PDFParse(new Uint8Array(data));
    const res = await parser.getText();
    console.log('Text:', res.text);
    parser.destroy();
  } catch (err) {
    console.error(err);
  }
}
run();
