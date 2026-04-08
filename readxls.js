const xlsx = require('xlsx');
const fs = require('fs');

const path = './PT.ClientSalesManager.xls';
if (!fs.existsSync(path)) {
    console.log('File not found:', path);
    process.exit(1);
}

const workbook = xlsx.readFile(path);
console.log('Sheet Names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0]; // Guessing the first sheet or we can check which one has 2026 data
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log('First 10 rows:');
data.slice(0, 10).forEach(row => console.log(JSON.stringify(row)));
