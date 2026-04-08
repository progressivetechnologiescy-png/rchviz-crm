// Auto-generated from Excel
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- INITIAL PIPELINE DATA ---
const initialLeadsData = {
    "tasks": {
        "task-2372": { "id": "task-2372", "client": "Oikogenesis", "project": "25", "value": "€2,000", "added": "Jan 9" },
        "task-2373": { "id": "task-2373", "client": "Rotiana Developers", "project": "12 Housee", "value": "€1,200", "added": "Jan 10" },
        "task-2381": { "id": "task-2381", "client": "Athanasiou", "project": "PT2381", "value": "€450", "added": "Feb 2" },
        "task-2386": { "id": "task-2386", "client": "Mavros", "project": "Nicosia", "value": "€500", "added": "Feb 17" },
        "task-2385": { "id": "task-2385", "client": "Inea Developments", "project": "Inea 5", "value": "€500", "added": "Feb 16" },
        "task-2384": { "id": "task-2384", "client": "Code", "project": "Wish Properties", "value": "€500", "added": "Feb 16" },
        "task-2383": { "id": "task-2383", "client": "Gianluca", "project": "Efeto", "value": "€500", "added": "Feb 11" },
        "task-2382": { "id": "task-2382", "client": "Gianluca", "project": "673", "value": "€500", "added": "Feb 11" },
        "task-2380": { "id": "task-2380", "client": "Athanasiou", "project": "PT2380", "value": "€450", "added": "Feb 3" },
        "task-2379": { "id": "task-2379", "client": "Acint Management", "project": "PT2379", "value": "€1,750", "added": "Feb 2" },
        "task-2378": { "id": "task-2378", "client": "Polys papsployvio", "project": "PT2378", "value": "€500", "added": "Jan 25" },
        "task-2377": { "id": "task-2377", "client": "Agapios", "project": "PT2377", "value": "€450", "added": "Jan 26" },
        "task-2376": { "id": "task-2376", "client": "Christos Mousaras", "project": "Court 19", "value": "€550", "added": "Jan 20" },
        "task-2375": { "id": "task-2375", "client": "Step Architecure", "project": "PT2375", "value": "€300", "added": "Jan 21" },
        "task-2374": { "id": "task-2374", "client": "Tasos For Ever Green", "project": "PT2374", "value": "€550", "added": "Jan 19" },
        "task-2371": { "id": "task-2371", "client": "Oikogenesis", "project": "27", "value": "€2,000", "added": "Jan 9" },
        "task-2370": { "id": "task-2370", "client": "Pambos Yiatros", "project": "PT2370", "value": "€550", "added": "Jan 7" }
    },
    "columns": {
        "column-1": { "id": "column-1", "title": "Inbox", "taskIds": ["task-2386", "task-2385"] },
        "column-2": { "id": "column-2", "title": "Contacted", "taskIds": ["task-2384", "task-2383", "task-2382", "task-2380", "task-2379"] },
        "column-3": { "id": "column-3", "title": "Proposal Sent", "taskIds": ["task-2381", "task-2378", "task-2377", "task-2376", "task-2375"] },
        "column-4": { "id": "column-4", "title": "Won", "taskIds": ["task-2372", "task-2373", "task-2371", "task-2370", "task-2374"] }
    },
    "columnOrder": [
        "column-1",
        "column-2",
        "column-3",
        "column-4"
    ]
};

// --- INITIAL METRICS ---
const initialMetrics = {
    activeProjects: 5,
    pendingReviews: 1,
    newLeads: 0,
    completedYTD: 5
};

// --- INITIAL PRODUCTION PROJECTS ---
const initialProjects =
    [
        { "id": "proj-2026-0", "name": "25", "client": "Oikogenesis", "reference": "PT2372", "status": "Completed", "progress": 100, "assignee": "Peter", "dueDate": "Jan 9, 2026", "totalAmount": 2000, "deposit": 0, "balance": 2000, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-1", "name": "12 Housee", "client": "Rotiana Developers", "reference": "PT2373", "status": "Completed", "progress": 100, "assignee": "Peter", "dueDate": "Jan 10, 2026", "totalAmount": 1200, "deposit": 0, "balance": 1200, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-2", "name": "Athanasiou Project", "client": "Athanasiou", "reference": "PT2381", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 2, 2026", "totalAmount": 450, "deposit": 0, "balance": 450, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-3", "name": "Nicosia", "client": "Mavros", "reference": "PT2386", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 17, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-4", "name": "Inea 5", "client": "Inea Developments", "reference": "PT2385", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 16, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-5", "name": "Wish Properties", "client": "Code", "reference": "PT2384", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 16, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-6", "name": "Efeto", "client": "Gianluca", "reference": "PT2383", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 11, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-7", "name": "673", "client": "Gianluca", "reference": "PT2382", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 11, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-8", "name": "Athanasiou Project 2", "client": "Athanasiou", "reference": "PT2380", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 3, 2026", "totalAmount": 450, "deposit": 0, "balance": 450, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-9", "name": "Acint Management Project", "client": "Acint Management", "reference": "PT2379", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Feb 2, 2026", "totalAmount": 1750, "deposit": 875, "balance": 875, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-10", "name": "Polys papsployvio Project", "client": "Polys papsployvio", "reference": "PT2378", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 25, 2026", "totalAmount": 500, "deposit": 0, "balance": 500, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-11", "name": "Agapios Project", "client": "Agapios", "reference": "PT2377", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 26, 2026", "totalAmount": 450, "deposit": 0, "balance": 450, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-12", "name": "Court 19", "client": "Christos Mousaras", "reference": "PT2376", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 20, 2026", "totalAmount": 550, "deposit": 0, "balance": 550, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-13", "name": "Step Architecure Project", "client": "Step Architecure", "reference": "PT2375", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 21, 2026", "totalAmount": 300, "deposit": 300, "balance": 0, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-14", "name": "Tasos For Ever Green Project", "client": "Tasos For Ever Green", "reference": "PT2374", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 19, 2026", "totalAmount": 550, "deposit": 550, "balance": 0, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-15", "name": "27", "client": "Oikogenesis", "reference": "PT2371", "status": "Completed", "progress": 100, "assignee": "Peter", "dueDate": "Jan 9, 2026", "totalAmount": 2000, "deposit": 0, "balance": 2000, "revisionCount": 0, "feedbackHistory": [] },
        { "id": "proj-2026-16", "name": "Pambos Yiatros Project", "client": "Pambos Yiatros", "reference": "PT2370", "status": "Queue", "progress": 0, "assignee": "Peter", "dueDate": "Jan 7, 2026", "totalAmount": 550, "deposit": 550, "balance": 0, "revisionCount": 0, "feedbackHistory": [] }
    ];


// --- INITIAL CLIENTS ---
const initialClients = [
    {
        "id": "client-oikogenesis",
        "name": "Oikogenesis",
        "contact": "Peter",
        "email": "contact@oikogenesis.com",
        "phone": "+357 32063554",
        "activeProjects": 1,
        "totalValue": "€2,000"
    },
    {
        "id": "client-oniropolis developers ltd",
        "name": "Oniropolis Developers Ltd",
        "contact": "Elena",
        "email": "contact@oniropolisdevelopersltd.com",
        "phone": "+357 20701961",
        "activeProjects": 1,
        "totalValue": "€400"
    },
    {
        "id": "client-m & del developers ltd",
        "name": "M & DEL Developers LTD",
        "contact": "Elena",
        "email": "contact@mdeldevelopersltd.com",
        "phone": "+357 37665372",
        "activeProjects": 1,
        "totalValue": "€450"
    },
    {
        "id": "client-studio 7",
        "name": "Studio 7",
        "contact": "Peter",
        "email": "contact@studio7.com",
        "phone": "+357 35111448",
        "activeProjects": 2,
        "totalValue": "€1,250"
    }
];

// --- INITIAL FOLDERS ---
const initialFolders = [
    { id: 'f1', projectId: 'proj-2026-0', name: 'Drafts 1' },
    { id: 'f2', projectId: 'proj-2026-0', name: 'Final Renders' },
    { id: 'f3', projectId: 'proj-2026-1', name: 'Client References' }
];

// --- INITIAL ASSETS ---
const initialAssets = [
    { id: 'a1', projectId: 'proj-2026-0', folderId: 'f1', name: 'Tower_Exterior_v2.max', type: '3D Model', size: '1.2 GB', modified: '2 hours ago', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', comments: [] },
    { id: 'a2', projectId: 'proj-2026-0', folderId: 'f2', name: 'Interior_Lobby_Final.png', type: 'Render', size: '24 MB', modified: '5 hours ago', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', comments: [] },
    { id: 'a3', projectId: 'proj-2026-1', folderId: 'f3', name: 'Master_Plan_References.zip', type: 'Archive', size: '450 MB', modified: '1 day ago', image: 'https://images.unsplash.com/photo-1431540015546-0a88c1448eb5?auto=format&fit=crop&q=80&w=800', comments: [] }
];

// --- INITIAL TASKS ---
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 5);

const initialTasks = [
    { id: 't1', title: 'Review rendering for Olive model', assignee: 'Peter', dueDate: today.toISOString(), priority: 'High', status: 'Pending', projectId: 'proj-2026-6' },
    { id: 't2', title: 'Send invoice to Studio 7', assignee: 'Elena', dueDate: today.toISOString(), priority: 'Medium', status: 'Completed', projectId: 'proj-2026-10' },
    { id: 't3', title: 'Draft proposal for new Latsia complex', assignee: 'Peter', dueDate: tomorrow.toISOString(), priority: 'High', status: 'Pending', projectId: null },
    { id: 't4', title: 'Update lighting on Oniropolis balcony', assignee: 'Elena', dueDate: tomorrow.toISOString(), priority: 'Medium', status: 'Pending', projectId: 'proj-2026-1' },
    { id: 't5', title: 'Monthly asset backup', assignee: 'Koss', dueDate: nextWeek.toISOString(), priority: 'Low', status: 'Pending', projectId: null }
];

// --- INITIAL EMPLOYEES ---
const initialEmployees = [
    { id: 'emp-1', name: 'Peter', initials: 'PR', role: 'employee', isOnline: true },
    { id: 'emp-2', name: 'Mirek', initials: 'MR', role: 'employee', isOnline: false },
    { id: 'emp-3', name: 'Koss', initials: 'KS', role: 'admin', isOnline: true }
];

export const useStore = create(
    persist(
        (set) => ({
            // Auth State
            currentUser: null,
            userRole: null, // Initial role
            isAuthenticated: false,

            // --- NOTIFICATIONS STATE ---
            notifications: [
                { id: 'n1', title: 'New Revision Request', desc: 'Oikogenesis requested changes on "25".', read: false, link: '/project/proj-2026-0' },
                { id: 'n2', title: 'Project Approved', desc: '"12 Housee" was approved by client.', read: false, link: '/project/proj-2026-1' },
                { id: 'n3', title: 'System Update', desc: 'Platform maintenance scheduled for tomorrow 2AM.', read: true, link: '/' }
            ],

            // --- CHAT CHANNELS & MESSAGES ---
            channels: [
                { id: 'channel-general', name: 'general', type: 'channel' },
                { id: 'channel-design', name: 'design', type: 'channel' },
                { id: 'channel-announcements', name: 'announcements', type: 'channel' },
                { id: 'channel-task-2372', name: 'deal-oikogenesis', type: 'deal', referenceId: 'task-2372' }
            ],
            addChannel: (channel) => set(state => ({ channels: [...state.channels, channel] })),
            messages: [
                { id: 'm1', channelId: 'channel-general', sender: 'Koss', role: 'admin', text: 'Hey team, please prioritize the Limassol Marina revisions today.', timestamp: new Date(Date.now() - 3600000).toISOString(), reactions: { '👍': ['Peter'] }, read: true },
                { id: 'm2', channelId: 'channel-general', sender: 'Peter', role: 'employee', text: 'On it. I will upload the new drafts by 3 PM.', timestamp: new Date(Date.now() - 3000000).toISOString(), reactions: {}, read: true },
                { id: 'm3', channelId: 'channel-design', sender: 'Mirek', role: 'employee', text: 'Here are the new moodboards for the exterior lobby.', timestamp: new Date(Date.now() - 2000000).toISOString(), reactions: { '🔥': ['Koss', 'Peter'] }, read: false },
                { id: 'm4', channelId: 'channel-task-2372', sender: 'Koss', role: 'admin', text: 'Opportunity won! Please align on the kickoff meeting times.', timestamp: new Date(Date.now() - 1000000).toISOString(), reactions: { '🎉': ['Peter'] }, read: true }
            ],
            addMessage: (channelId, msg) => {
                set(state => {
                    const isNewMessageFromOther = msg.sender !== state.currentUser?.name;

                    if (isNewMessageFromOther && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification(`New message from ${msg.sender}`, {
                            body: msg.text || 'Sent an image attachment.',
                            icon: 'https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png'
                        });
                    }

                    return {
                        messages: [...state.messages, { ...msg, channelId, id: `msg-${Date.now()}`, reactions: {}, read: false }]
                    };
                });
            },
            markMessagesAsRead: (channelId) => set(state => {
                const hasUnread = state.messages.some(m =>
                    m.channelId === channelId && m.sender !== state.currentUser?.name && !m.read
                );

                if (!hasUnread) return state; // Break the infinite render loop

                return {
                    messages: state.messages.map(m =>
                        m.channelId === channelId && m.sender !== state.currentUser?.name && !m.read ? { ...m, read: true } : m
                    )
                };
            }),
            markAllMessagesAsRead: () => set(state => {
                const hasUnread = state.messages.some(m => m.sender !== state.currentUser?.name && !m.read);
                if (!hasUnread) return state;
                return {
                    messages: state.messages.map(m =>
                        m.sender !== state.currentUser?.name ? { ...m, read: true } : m
                    )
                };
            }),
            addReaction: (messageId, emoji) => set(state => ({
                messages: state.messages.map(m => {
                    if (m.id === messageId) {
                        const reactions = m.reactions || {};
                        const current = reactions[emoji] || [];
                        const userName = state.currentUser?.name || 'Unknown';
                        const hasReacted = current.includes(userName);
                        return {
                            ...m,
                            reactions: {
                                ...reactions,
                                [emoji]: hasReacted ? current.filter(u => u !== userName) : [...current, userName]
                            }
                        };
                    }
                    return m;
                })
            })),

            // --- ACTIONS ---
            login: (email, role) => set({
                currentUser: {
                    email,
                    name: role === 'admin' ? 'Koss' : role === 'client' ? 'Client Partner' : 'Production Team',
                    avatar: ''
                },
                userRole: role,
                isAuthenticated: true
            }),

            updateProfile: (updates) => set((state) => ({
                currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
            })),

            logout: () => set({
                currentUser: null,
                userRole: null,
                isAuthenticated: false
            }),

            markNotificationRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
            })),
            toggleNotificationRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: !n.read } : n)
            })),
            markAllNotificationsRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            })),
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

            // Dashboard Layout State
            dashboardLayout: ['active-projects', 'completion-ratio', 'total-revenue', 'outstanding'],
            updateDashboardLayout: (newLayout) => set({ dashboardLayout: newLayout }),
            dashboardModules: ['stats', 'daily-tasks', 'analytics', 'recent-projects', 'activity-feed'],
            updateDashboardModules: (newLayout) => set({ dashboardModules: newLayout }),

            // Pipeline State
            pipelineData: initialLeadsData,
            setPipelineData: (newData) => set({ pipelineData: newData }),
            addLead: (lead) => set((state) => {
                const newTaskId = `task-${Date.now()}`;
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
            addProject: (project) => set((state) => ({
                projects: [{
                    ...project,
                    id: `proj-${Date.now()}`,
                    totalAmount: project.totalAmount || 0,
                    deposit: project.deposit || 0,
                    balance: (project.totalAmount || 0) - (project.deposit || 0),
                    revisionCount: 0,
                    feedbackHistory: []
                }, ...state.projects]
            })),
            updateProjectStatus: (id, newStatus) => set((state) => ({
                projects: state.projects.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            status: newStatus,
                            progress: newStatus === 'Completed' ? 100 : (newStatus === 'Queue' ? 0 : p.progress)
                        };
                    }
                    return p;
                })
            })),
            updateProjectField: (id, field, value) => set((state) => ({
                projects: state.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
            })),
            addProjectFeedback: (id, feedback) => set((state) => ({
                projects: state.projects.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            status: 'Revising', // Send back to revising
                            revisionCount: p.revisionCount + 1,
                            feedbackHistory: [{ date: new Date().toLocaleDateString(), ...feedback }, ...p.feedbackHistory]
                        };
                    }
                    return p;
                })
            })),

            // Clients State
            clients: initialClients,
            setClients: (clients) => set({ clients }),
            addClient: (client) => set((state) => ({ clients: [{ ...client, id: `client-${Date.now()}` }, ...state.clients] })),
            updateClient: (id, updatedClient) => set((state) => {
                const exists = state.clients.some(c => c.id === id);
                if (exists) {
                    return { clients: state.clients.map(c => c.id === id ? { ...c, ...updatedClient } : c) };
                } else {
                    return { clients: [{ ...updatedClient, id }, ...state.clients] };
                }
            }),
            deleteClient: (id) => set((state) => ({
                clients: state.clients.filter(c => c.id !== id)
            })),

            // Assets State
            folders: initialFolders,
            addFolder: (folder) => set((state) => ({ folders: [{ ...folder, id: `folder-${Date.now()}` }, ...state.folders] })),

            assets: initialAssets,
            setAssets: (assets) => set({ assets }),
            addAsset: (asset) => set((state) => ({ assets: [{ ...asset, id: `asset-${Date.now()}` }, ...state.assets] })),
            addAssetComment: (assetId, comment) => set((state) => ({
                assets: state.assets.map(a => a.id === assetId ? { ...a, comments: [...(a.comments || []), comment] } : a)
            })),

            // Tasks State
            tasks: initialTasks,
            addTask: (task) => set((state) => ({
                tasks: [{ ...task, id: `task-${Date.now()}`, status: 'Pending' }, ...state.tasks]
            })),
            updateTaskStatus: (id, newStatus) => set((state) => {
                const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
                const task = state.tasks.find(t => t.id === id);

                // If a task is completed by an employee, notify the admin
                if (newStatus === 'Completed' && task && task.status !== 'Completed' && state.userRole === 'employee') {
                    const newNotification = {
                        id: `ntf-${Date.now()}`,
                        title: 'Task Completed',
                        desc: `${state.currentUser?.name} completed task: "${task.title}"`,
                        read: false,
                        link: '/tasks'
                    };
                    return { tasks: updatedTasks, notifications: [newNotification, ...state.notifications] };
                }

                return { tasks: updatedTasks };
            }),
            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id)
            })),

            // Employees State
            employees: initialEmployees,
            addEmployee: (employee) => set((state) => ({
                employees: [...state.employees, { ...employee, id: `emp-${Date.now()}` }]
            })),
            updateEmployee: (id, updates) => set((state) => ({
                employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
            }))
        }),
        {
            name: 'crm-storage-v10', // Bumped version to inject updated mock data
            getStorage: () => localStorage,
        }
    )
);
