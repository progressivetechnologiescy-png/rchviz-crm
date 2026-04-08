// Auto-generated from Excel
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- INITIAL PIPELINE DATA ---
const initialLeadsData = { tasks: {}, columns: { "column-1": { id: "column-1", title: "Inbox", taskIds: [] }, "column-2": { id: "column-2", title: "Contacted", taskIds: [] }, "column-3": { id: "column-3", title: "Proposal Sent", taskIds: [] }, "column-4": { id: "column-4", title: "Won", taskIds: [] } }, columnOrder: ["column-1", "column-2", "column-3", "column-4"] };

// --- INITIAL METRICS ---
const initialMetrics = {
    activeProjects: 5,
    pendingReviews: 1,
    newLeads: 0,
    completedYTD: 5
};

// --- INITIAL PRODUCTION PROJECTS ---
const initialProjects = [];


// --- INITIAL CLIENTS ---
const initialClients = [];

// --- INITIAL FOLDERS ---
const initialFolders = [];

// --- INITIAL ASSETS ---
const initialAssets = [];

// --- INITIAL TASKS ---
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 5);

const initialTasks = [];

// --- INITIAL EMPLOYEES ---
const initialEmployees = [];

export const useStore = create(
    persist(
        (set) => ({
            // Auth State
            currentUser: null,
            userRole: null, // Initial role
            isAuthenticated: false,

            // --- NOTIFICATIONS STATE ---
            notifications: [],

            // --- CHAT CHANNELS & MESSAGES ---
            channels: [
                { id: 'channel-general', name: 'general', type: 'channel' },
                { id: 'channel-design', name: 'design', type: 'channel' },
                { id: 'channel-announcements', name: 'announcements', type: 'channel' },
                { id: 'channel-task-2372', name: 'deal-oikogenesis', type: 'deal', referenceId: 'task-2372' }
            ],
            addChannel: (channel) => set(state => ({ channels: [...state.channels, channel] })),
            messages: [],
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
            setPipelineData: (pipelineData) => set({ pipelineData }),

            // Push an emailed lead directly into the 'Contacted' column (column-2)
            addPipelineLead: (lead) => set((state) => {
                const newTaskId = `task-${Date.now()}`;

                // Construct the task card from the lead data
                const newTask = {
                    id: newTaskId,
                    client: lead.company,
                    project: 'Outreach',
                    value: 'TBD',
                    added: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                };

                // Add task to task map and to column-2 taskIds array
                return {
                    pipelineData: {
                        ...state.pipelineData,
                        tasks: {
                            ...state.pipelineData.tasks,
                            [newTaskId]: newTask
                        },
                        columns: {
                            ...state.pipelineData.columns,
                            'column-2': {
                                ...state.pipelineData.columns['column-2'],
                                taskIds: [newTaskId, ...state.pipelineData.columns['column-2'].taskIds]
                            }
                        }
                    }
                };
            }),

            // Update a specific task/card in the pipeline
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
            updatePipelineData: (newData) => set({ pipelineData: newData }),

            // Metrics State
            metrics: initialMetrics,

            // Production State
            projects: initialProjects,
            addProject: (project) => set((state) => ({
                projects: [{
                    ...project,
                    id: project.id || `proj-${Date.now()}`,
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
            addFolder: (folder) => set((state) => ({ folders: [{ ...folder, id: `folder-${Date.now().toString() + Math.random().toString(36).substr(2, 9)}` }, ...state.folders] })),
            deleteFolder: (folderId) => set((state) => ({
                folders: state.folders.filter(f => f.id !== folderId)
            })),

            assets: initialAssets,
            setAssets: (assets) => set({ assets }),
            addAsset: (asset) => set((state) => ({ assets: [{ ...asset, id: `asset-${Date.now()}` }, ...state.assets] })),
            deleteAsset: (assetId) => set((state) => ({
                assets: state.assets.filter(a => a.id !== assetId)
            })),
            addAssetComment: (assetId, comment) => set((state) => ({
                assets: state.assets.map(a => a.id === assetId ? { ...a, comments: [...(a.comments || []), comment] } : a)
            })),
            addAnnotation: (assetId, annotation) => set((state) => ({
                assets: state.assets.map(a =>
                    a.id === assetId
                        ? { ...a, annotations: [...(a.annotations || []), { ...annotation, id: `ann-${Date.now()}`, timestamp: new Date().toISOString(), status: 'open' }] }
                        : a
                )
            })),
            resolveAnnotation: (assetId, annotationId) => set((state) => ({
                assets: state.assets.map(a =>
                    a.id === assetId
                        ? { ...a, annotations: (a.annotations || []).map(ann => ann.id === annotationId ? { ...ann, status: 'resolved' } : ann) }
                        : a
                )
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
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
            })),
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
            })),

            // CRM Lead Generation Banning
            bannedLeads: [],
            banLead: (website) => set((state) => ({
                bannedLeads: state.bannedLeads.includes(website) ? state.bannedLeads : [...state.bannedLeads, website]
            })),
            unbanLead: (website) => set((state) => ({
                bannedLeads: state.bannedLeads.filter(url => url !== website)
            })),

            // CRM Lead Generation Sent Leads
            sentLeads: [],
            addSentLead: (website) => set((state) => ({
                sentLeads: state.sentLeads.includes(website) ? state.sentLeads : [...state.sentLeads, website]
            })),
            removeSentLead: (website) => set((state) => ({
                sentLeads: state.sentLeads.filter(url => url !== website)
            }))
        }),
        {
            name: 'crm-storage-v12', // Bumped version to flush old local storage
            getStorage: () => localStorage,
        }
    )
);
