const xlsx = require('xlsx');
const fs = require('fs');

const path = './PT.ClientSalesManager.xls';
if (!fs.existsSync(path)) {
    console.log('File not found:', path);
    process.exit(1);
}

const workbook = xlsx.readFile(path);
console.log('Sheet Names:', workbook.SheetNames);

const sheetName = workbook.SheetNames.find(name => name.includes('2026')) || workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet);
console.log('Columns: ', Object.keys(data[0] || {}));

// Filter logic if needed later
const data2026 = data.filter(row => {
    // We will inspect first to see how years are denoted
    return true;
});

console.log('Total rows: ', data.length);
console.log('Sample rows:');
data.slice(0, 5).forEach(row => console.log(JSON.stringify(row, null, 2)));
