const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function convertExcelDateToJSDate(serial) {
    if (!serial) return new Date();
    // Excel dates originate from Jan 1, 1900.
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
}

function generateInitialData() {
    try {
        const workbook = xlsx.readFile('./PT.ClientSalesManager.xls');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Read starting from row 2 natively using sheet_to_json
        const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        const leadsData = {
            tasks: {},
            columns: {
                'column-1': { id: 'column-1', title: 'Inbox', taskIds: [] },
                'column-2': { id: 'column-2', title: 'Contacted', taskIds: [] },
                'column-3': { id: 'column-3', title: 'Proposal Sent', taskIds: [] },
                'column-4': { id: 'column-4', title: 'Won', taskIds: [] }
            },
            columnOrder: ['column-1', 'column-2', 'column-3', 'column-4']
        };

        const activeProjects = [];

        const uniqueClientsMap = new Map();

        data.forEach((row, index) => {
            if (!row['Customer Name']) return; // Skip empty rows

            const clientName = row['Customer Name'].trim();
            const projectName = row['Project Name'] ? row['Project Name'].trim() : "Unnamed Project";
            const id = `task-${index + 1}`;
            const projId = `proj-${index + 1}`;
            const price = parseFloat(row['Price']) || 0;
            const received = parseFloat(row['Received']) || 0;

            // Map to Pipeline leads
            leadsData.tasks[id] = {
                id: id,
                client: clientName,
                projectCount: 1,
                value: `$${price.toLocaleString()}`,
                added: row['Month'] || "Unknown"
            };

            // Put everyone in won since they have prices
            leadsData.columns['column-4'].taskIds.push(id);

            // Map to Production projects
            const dateObj = convertExcelDateToJSDate(row['Date']);
            const is2026 = !isNaN(dateObj) && dateObj.getFullYear() === 2026;
            const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD";

            const statusStage = is2026 ? 'Modeling' : 'Completed';

            activeProjects.push({
                id: projId,
                name: projectName,
                client: clientName,
                status: statusStage,
                progress: is2026 ? Math.floor(Math.random() * 80) + 10 : 100,
                assignee: row['Account Ecec.'] ? row['Account Ecec.'].substring(0, 2).toUpperCase() : "PT",
                dueDate: formattedDate
            });

            if (!uniqueClientsMap.has(clientName)) {
                uniqueClientsMap.set(clientName, {
                    id: `client-${clientName.replace(/\\s+/g, '-').toLowerCase()}`,
                    name: clientName,
                    contact: row['Account Ecec.'] ? row['Account Ecec.'].substring(0, 2).toUpperCase() : "Account Team",
                    email: `contact@${clientName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
                    phone: '+357 ' + Math.floor(20000000 + Math.random() * 90000000),
                    activeProjects: 1,
                    totalValue: price
                });
            } else {
                const clientInfo = uniqueClientsMap.get(clientName);
                clientInfo.activeProjects += 1;
                clientInfo.totalValue += price;
            }
        });

        const activeClients = Array.from(uniqueClientsMap.values());
        activeClients.forEach(c => c.totalValue = `$${c.totalValue.toLocaleString()}`);

        const storeContent = `// Auto-generated from Excel
import { create } from 'zustand';

// --- INITIAL PIPELINE DATA ---
const initialLeadsData = ${JSON.stringify(leadsData, null, 4)};

// --- INITIAL METRICS ---
const initialMetrics = {
    activeProjects: ${activeProjects.length},
    pendingReviews: ${Math.floor(activeProjects.length * 0.2)},
    newLeads: ${leadsData.columns['column-1'].taskIds.length},
    completedYTD: ${leadsData.columns['column-4'].taskIds.length}
};

// --- INITIAL PRODUCTION PROJECTS ---
const initialProjects = ${JSON.stringify(activeProjects, null, 4)};

// --- INITIAL CLIENTS ---
const initialClients = ${JSON.stringify(activeClients, null, 4)};

// --- INITIAL ASSETS ---
const initialAssets = [
    { id: 'a1', name: 'Tower_Exterior_v2.max', type: '3D Model', size: '1.2 GB', modified: '2 hours ago', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
    { id: 'a2', name: 'Interior_Lobby_Final.png', type: 'Render', size: '24 MB', modified: '5 hours ago', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
    { id: 'a3', name: 'Master_Plan_References.zip', type: 'Archive', size: '450 MB', modified: '1 day ago', image: 'https://images.unsplash.com/photo-1431540015546-0a88c1448eb5?auto=format&fit=crop&q=80&w=800' }
];

export const useStore = create((set) => ({
    // Theme State
    theme: 'dark',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (newTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        return { theme: newTheme };
    }),

    // Pipeline State
    pipelineData: initialLeadsData,
    setPipelineData: (newData) => set({ pipelineData: newData }),
    addLead: (lead) => set((state) => {
        const newTaskId = \`task-\${Date.now()}\`;
        const newLead = { ...lead, id: newTaskId };
        const updatedTasks = { ...state.pipelineData.tasks, [newTaskId]: newLead };
        const inboxCol = state.pipelineData.columns["column-1"];
        const updatedInbox = { ...inboxCol, taskIds: [newTaskId, ...inboxCol.taskIds] };
        return {
            pipelineData: {
                ...state.pipelineData,
                tasks: updatedTasks,
                columns: {
                    ...state.pipelineData.columns,
                    "column-1": updatedInbox
                }
            }
        };
    }),

    // Metrics State
    metrics: initialMetrics,

    // Production State
    projects: initialProjects,
    addProject: (project) => set((state) => ({ projects: [{...project, id: \`proj-\${Date.now()}\`}, ...state.projects] })),

    // Clients State
    clients: initialClients,
    setClients: (clients) => set({ clients }),
    addClient: (client) => set((state) => ({ clients: [{...client, id: \`client-\${Date.now()}\`}, ...state.clients] })),

    // Assets State
    assets: initialAssets
}));
`;

        fs.writeFileSync(path.join(__dirname, 'src', 'store.js'), storeContent, 'utf-8');
        console.log("Successfully imported excel data to store.js!");

    } catch (error) {
        console.error("Error generating store data:", error);
    }
}

generateInitialData();
