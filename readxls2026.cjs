const xlsx = require('xlsx');
const fs = require('fs');

const path = './PT.ClientSalesManager.xls';
const workbook = xlsx.readFile(path);
const worksheet = workbook.Sheets['2026'];

const data = xlsx.utils.sheet_to_json(worksheet);

// We need to parse this into our store.js 'initialProjects' format:
// { id, name, client, reference, status, progress, assignee, dueDate, totalAmount, deposit, balance, revisionCount, feedbackHistory }

const storeData = data.map((row, idx) => {
    // Assuming columns based on typical sales manager sheets. Let's see what keys are there.
    return row;
});

console.log('Columns: ', Object.keys(data[0] || {}));
console.log('Sample Row 0: ', data[0]);
console.log('Sample Row 1: ', data[1]);
