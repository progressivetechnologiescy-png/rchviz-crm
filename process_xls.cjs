const xlsx = require('xlsx');
const fs = require('fs');

const path = './PT.ClientSalesManager.xls';
const workbook = xlsx.readFile(path);
const worksheet = workbook.Sheets['2026'];
const data = xlsx.utils.sheet_to_json(worksheet);

const statuses = ['Queue', 'Modeling', 'Drafting', 'Client Review', 'Revising', 'Completed'];

// Helper to reliably map
const mappedProjects = data.map((row, idx) => {
    // some parsing to keep data clean
    const client = row['Customer Name'] || 'Unknown Client';
    const name = row['Project Name'] ? String(row['Project Name']) : `Project ${idx + 1}`;
    const ref = row['PT#'] || `PT2026-${idx}`;
    const price = Number(row['Price']) || 0;
    const received = Number(row['Received']) || 0;
    const balance = Number(row['Balance']) || (price - received);
    const exec = row['Account Ecec.'] === 'Protech' ? 'PR' : (row['Account Ecec.'] || 'Unassigned');

    // Distribute status pseudo-randomly for visual demo, but keeping it logical
    const status = (balance === 0) ? 'Completed' : statuses[Math.floor(Math.random() * (statuses.length - 1))];
    const progress = status === 'Completed' ? 100 : (status === 'Queue' ? 0 : Math.floor(Math.random() * 80) + 10);

    return {
        id: `proj-2026-${idx}`,
        name: name,
        client: client,
        reference: ref,
        status: status,
        progress: progress,
        assignee: exec,
        dueDate: `Dec ${Math.floor(Math.random() * 28) + 1}, 2026`, // Mocking due date based on month might be better but let's keep it simple
        totalAmount: price,
        deposit: received,
        balance: balance,
        revisionCount: 0,
        feedbackHistory: []
    };
});

fs.writeFileSync('initialProjects.json', JSON.stringify(mappedProjects, null, 4));
console.log('Successfully wrote to initialProjects.json');
