// Auto-generated from Excel
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';


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
        (set, get) => ({
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
            login: (email, role) => {
                set({
                    currentUser: {
                        email,
                        name: role === 'admin' ? 'Koss' : role === 'client' ? 'Client Partner' : 'Production Team',
                        avatar: ''
                    },
                    userRole: role,
                    isAuthenticated: true
                });
                // Fetch fresh DB data into local store on login
                get().fetchProjects();
                get().fetchLeads();
            },

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

            // Fetch ALL leads and re-distribute them into the pipeline UI
            fetchLeads: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/leads`);
                    const json = await res.json();
                    if (json.success && json.data) {
                        const dbLeads = json.data;
                        
                        // Map them into the pipeline structure
                        let newTasks = {};
                        let newCols = {
                            "column-1": { id: "column-1", title: "Inbox", taskIds: [] },
                            "column-2": { id: "column-2", title: "Contacted", taskIds: [] },
                            "column-3": { id: "column-3", title: "Proposal Sent", taskIds: [] },
                            "column-4": { id: "column-4", title: "Won", taskIds: [] }
                        };

                        dbLeads.forEach(lead => {
                            newTasks[lead.id] = {
                                id: lead.id,
                                client: lead.company,
                                project: 'Outreach', // Default
                                value: lead.value || 'TBD',
                                added: lead.addedDate || new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            };
                            
                            // Sort logic
                            if (lead.status === 'Contacted') newCols['column-2'].taskIds.push(lead.id);
                            else if (lead.status === 'Proposal Sent') newCols['column-3'].taskIds.push(lead.id);
                            else if (lead.status === 'Won') newCols['column-4'].taskIds.push(lead.id);
                            else newCols['column-1'].taskIds.push(lead.id);
                        });

                        set({
                            pipelineData: {
                                tasks: newTasks,
                                columns: newCols,
                                columnOrder: ["column-1", "column-2", "column-3", "column-4"]
                            }
                        });
                    }
                } catch (e) { console.error("Failed to fetch leads", e); }
            },

            // Push an emailed lead directly into the 'Contacted' column (column-2)
            addPipelineLead: async (lead) => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/leads`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            company: lead.company,
                            website: lead.website || null,
                            email: lead.email || null,
                            status: 'Contacted',
                            addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        })
                    });
                    const json = await res.json();
                    if (json.success) {
                        const newTaskId = json.data.id;
                        const newTask = {
                            id: newTaskId,
                            client: json.data.company,
                            project: 'Outreach',
                            value: 'TBD',
                            added: json.data.addedDate
                        };
                        set((state) => ({
                            pipelineData: {
                                ...state.pipelineData,
                                tasks: { ...state.pipelineData.tasks, [newTaskId]: newTask },
                                columns: {
                                    ...state.pipelineData.columns,
                                    'column-2': {
                                        ...state.pipelineData.columns['column-2'],
                                        taskIds: [newTaskId, ...state.pipelineData.columns['column-2'].taskIds]
                                    }
                                }
                            }
                        }));
                    }
                } catch(e) { console.error("API error", e); }
            },

            // Update a specific task/card in the pipeline
            addLead: async (lead) => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/leads`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            company: lead.client || 'Unknown Client',
                            status: 'Discovered',
                            value: lead.value || 'TBD',
                            addedDate: lead.added || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        })
                    });
                    const json = await res.json();
                    if (json.success) {
                        const newTaskId = json.data.id;
                        const newLead = { ...lead, id: newTaskId };
                        set((state) => {
                            const updatedTasks = { ...state.pipelineData.tasks, [newTaskId]: newLead };
                            const inboxCol = state.pipelineData.columns["column-1"];
                            const updatedInbox = { ...inboxCol, taskIds: [newTaskId, ...inboxCol.taskIds] };
                            return {
                                pipelineData: {
                                    ...state.pipelineData,
                                    tasks: updatedTasks,
                                    columns: { ...state.pipelineData.columns, "column-1": updatedInbox }
                                }
                            };
                        });
                    }
                } catch(e) { console.error("Add Lead error", e); }
            },
            updatePipelineData: (newData) => set({ pipelineData: newData }),

            // Metrics State
            metrics: initialMetrics,

            // Production State
            projects: initialProjects,
            fetchProjects: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/projects`);
                    const json = await res.json();
                    if (json.success) {
                        const mappedProjects = json.data.map(p => ({ ...p, client: p.clientName || 'Unknown' }));
                        set({ projects: mappedProjects });
                    }
                } catch (e) { console.error("Failed to fetch projects frontend", e); }
            },
            addProject: async (project) => {
                try {
                    const reqObj = {
                        name: project.name || 'Unnamed Project',
                        clientName: project.client || 'Unknown',
                        clientId: null,
                        totalAmount: Number(project.totalAmount || 0),
                        deposit: Number(project.deposit || 0),
                        assignee: project.assignee || 'Unassigned',
                        status: project.status || 'Queue'
                    };
                    const res = await fetch(`${API_BASE}/api/v1/projects`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reqObj)
                    });
                    const json = await res.json();
                    if (json.success) {
                        const savedProject = { ...json.data, client: json.data.clientName };
                        set(state => ({ projects: [savedProject, ...state.projects] }));
                    }
                } catch (e) { console.error("Failed to add project", e); }
            },
            updateProjectStatus: async (id, newStatus) => {
                // Optimistic UI update
                set((state) => ({
                    projects: state.projects.map(p => {
                        if (p.id === id) {
                            return { ...p, status: newStatus, progress: newStatus === 'Completed' ? 100 : (newStatus === 'Queue' ? 0 : p.progress) };
                        }
                        return p;
                    })
                }));
                // Update Backend
                const progressVal = newStatus === 'Completed' ? 100 : (newStatus === 'Queue' ? 0 : undefined);
                try {
                    await fetch(`${API_BASE}/api/v1/projects/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(progressVal !== undefined ? { status: newStatus, progress: progressVal } : { status: newStatus })
                    });
                } catch (e) { console.error(e); }
            },
            updateProjectField: async (id, field, value) => {
                set((state) => ({
                    projects: state.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
                }));
                try {
                    await fetch(`${API_BASE}/api/v1/projects/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [field]: field.includes('Amount') || field.includes('deposit') ? Number(value) : value })
                    });
                } catch (e) { console.error(e); }
            },
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
