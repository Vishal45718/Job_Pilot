const { PDFParse } = require('pdf-parse');
const fs = require('fs');
async function run() {
  try {
    PDFParse.setWorker("");
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
