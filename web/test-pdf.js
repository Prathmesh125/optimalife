const fs = require('fs');
if (typeof DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}
const pdfParse = require('pdf-parse');
console.log("pdf-parse loaded successfully!");
