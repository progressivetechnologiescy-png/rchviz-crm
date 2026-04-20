// Auto-generated from Excel
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001' : 'https://rchviz-crm.onrender.com');


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
            channels: [],
            fetchChannels: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/channels`);
                    const json = await res.json();
                    if (json.success) set({ channels: json.data });
                } catch(e) { console.error("API Error fetchChannels", e) }
            },
            addChannel: async (channel) => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/channels`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: channel.name, type: channel.type, referenceId: channel.referenceId })
                    });
                    const json = await res.json();
                    if (json.success) set(state => ({ channels: [...state.channels, json.data] }));
                } catch(e) { console.error("API Error addChannel", e) }
            },
            
            messages: [],
            fetchMessages: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/messages`);
                    const json = await res.json();
                    if (json.success) set({ messages: json.data });
                } catch(e) { console.error("API Error fetchMessages", e) }
            },
            addMessage: async (channelId, msg) => {
                const tempId = `msg-${Date.now()}`;
                set(state => {
                    const isNewMessageFromOther = msg.sender !== state.currentUser?.name;
                    if (isNewMessageFromOther && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification(`New message from ${msg.sender}`, {
                            body: msg.text || 'Sent an image attachment.',
                            icon: 'https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png'
                        });
                    }
                    return {
                        messages: [...state.messages, { ...msg, channelId, id: tempId, reactions: {}, read: false }]
                    };
                });

                try {
                    await fetch(`${API_BASE}/api/v1/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            channelId,
                            sender: msg.sender,
                            text: msg.text || null,
                            imageUrl: msg.imageUrl || null
                        })
                    });
                } catch(e) { console.error("API Error addMessage", e) }
            },
            markMessagesAsRead: (channelId) => set(state => {
                const hasUnread = state.messages.some(m =>
                    m.channelId === channelId && m.sender !== state.currentUser?.name && !m.read
                );
                if (!hasUnread) return state; 
                // Note: For a live environment, a batch PUT request should be emitted to `/api/v1/messages` but optimistic state is fine for now
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
            login: (userData, role) => {
                // If userData is literally a string email (fallback), wrap it
                const userObj = typeof userData === 'string' ? { email: userData } : userData;
                
                // Extract possible custom preferences returned by Cloud Auth
                const prefs = userObj.preferences || {};
                
                set({
                    currentUser: {
                        email: userObj.email,
                        name: userObj.name || (role === 'admin' ? 'Koss' : role === 'client' ? 'Client Partner' : 'Production Team'),
                        avatar: userObj.avatar || ''
                    },
                    userRole: role || userObj.role,
                    isAuthenticated: true,
                    ...(prefs.layout ? { dashboardLayout: prefs.layout } : {}),
                    ...(prefs.modules ? { dashboardModules: prefs.modules } : {})
                });
                // Fetch fresh DB data into local store on login
                get().fetchProjects();
                get().fetchLeads();
                get().fetchClients();
                get().fetchTasks();
                get().fetchFolders();
                get().fetchAssets();
                get().fetchChannels();
                get().fetchMessages();
                get().fetchEmployees();
            },

            updateProfile: (updates) => {
                // Optimistic instant UI update
                set((state) => ({
                    currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
                }));

                // Push to centralized cloud DB
                const state = get();
                if (state.currentUser && state.currentUser.email) {
                    fetch(`${API_BASE}/api/v1/users/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: state.currentUser.email, ...updates })
                    }).catch(e => console.error("Cloud Profile Sync failed", e));
                }
            },

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

            // Dashboard Layout & Mobile State
            mobileMenuOpen: false,
            setMobileMenuOpen: (isOpen) => set({ mobileMenuOpen: isOpen }),
            toggleMobileMenu: () => set(state => ({ mobileMenuOpen: !state.mobileMenuOpen })),
            dashboardLayout: ['active-projects', 'completion-ratio', 'total-revenue', 'outstanding'],
            updateDashboardLayout: (newLayout) => {
                set({ dashboardLayout: newLayout });
                const state = get();
                if (state.currentUser && state.currentUser.email) {
                    fetch(`${API_BASE}/api/v1/users/preferences`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: state.currentUser.email, preferences: { layout: newLayout, modules: state.dashboardModules } })
                    }).catch(e => console.error("Cloud Layout Sync failed", e));
                }
            },
            dashboardModules: ['stats', 'daily-tasks', 'analytics', 'recent-projects', 'activity-feed'],
            updateDashboardModules: (newLayout) => {
                set({ dashboardModules: newLayout });
                const state = get();
                if (state.currentUser && state.currentUser.email) {
                    fetch(`${API_BASE}/api/v1/users/preferences`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: state.currentUser.email, preferences: { layout: state.dashboardLayout, modules: newLayout } })
                    }).catch(e => console.error("Cloud Modules Sync failed", e));
                }
            },
            
            fetchPreferences: async () => {
                const state = get();
                if (state.currentUser && state.currentUser.email) {
                    try {
                        const res = await fetch(`${API_BASE}/api/v1/users/profile?email=${encodeURIComponent(state.currentUser.email)}`);
                        if(res.ok) {
                            const json = await res.json();
                            if(json.success && json.data && json.data.preferences) {
                                const prefs = json.data.preferences;
                                set({
                                    ...(prefs.layout ? { dashboardLayout: prefs.layout } : {}),
                                    ...(prefs.modules ? { dashboardModules: prefs.modules } : {})
                                });
                            }
                        }
                    } catch(e) { console.error("Failed to fetch preferences", e); }
                }
            },

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

            removePipelineLead: async (taskId) => {
                set((state) => {
                    const newTasks = { ...state.pipelineData.tasks };
                    delete newTasks[taskId];

                    const newCols = { ...state.pipelineData.columns };
                    for (const colId in newCols) {
                        newCols[colId] = {
                            ...newCols[colId],
                            taskIds: newCols[colId].taskIds.filter(id => id !== taskId)
                        };
                    }

                    return {
                        pipelineData: {
                            ...state.pipelineData,
                            tasks: newTasks,
                            columns: newCols
                        }
                    };
                });
                try {
                    await fetch(`${API_BASE}/api/v1/leads/${taskId}`, { method: 'DELETE' });
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
                get().fetchPreferences();
                try {
                    const res = await fetch(`${API_BASE}/api/v1/projects`);
                    const json = await res.json();
                    if (json.success) {
                        let maxNum = 2399;
                        const mappedProjects = json.data.map(p => {
                            if (p.reference && p.reference.startsWith('PT')) {
                                const num = parseInt(p.reference.replace('PT', ''), 10);
                                if (!isNaN(num) && num > maxNum) maxNum = num;
                            }
                            return {
                                ...p,
                                client: p.clientName || 'Unknown',
                                balance: (Number(p.totalAmount) || 0) - (Number(p.deposit) || 0)
                            };
                        });
                        
                        const backfilledProjects = mappedProjects.map(p => {
                            if (!p.reference) {
                                maxNum++;
                                const newRef = `PT${maxNum}`;
                                fetch(`${API_BASE}/api/v1/projects/${p.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reference: newRef })
                                }).catch(console.error);
                                return { ...p, reference: newRef };
                            }
                            return p;
                        });

                        set({ projects: backfilledProjects });
                    }
                } catch (e) { console.error("Failed to fetch projects frontend", e); }
            },
            addProject: async (project) => {
                try {
                    const reqObj = {
                        reference: project.reference || null,
                        name: project.name || 'Unnamed Project',
                        clientName: project.client || 'Unknown',
                        clientId: project.clientId || null,
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
                        const savedProject = { 
                            ...json.data, 
                            client: json.data.clientName,
                            balance: (Number(json.data.totalAmount) || 0) - (Number(json.data.deposit) || 0)
                        };
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
                    projects: state.projects.map(p => {
                        if (p.id === id) {
                            const updated = { ...p, [field]: value };
                            // Auto-compute virtual balance if billing changes
                            if (field === 'totalAmount' || field === 'deposit') {
                                updated.balance = (Number(updated.totalAmount) || 0) - (Number(updated.deposit) || 0);
                            }
                            return updated;
                        }
                        return p;
                    })
                }));
                
                // Block virtual/computed fields from being sent to Prisma
                if (field === 'balance' || field === 'client') return;

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
            
            fetchClients: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/clients`);
                    const json = await res.json();
                    if (json.success) set({ clients: json.data });
                } catch(e) { console.error("API Error fetchClients", e); }
            },
            
            addClient: async (client) => {
                try {
                    const reqObj = {
                        name: client.name || 'Unnamed Client',
                        contact: client.contact || '',
                        email: client.email || '',
                        phone: client.phone || ''
                    };
                    const res = await fetch(`${API_BASE}/api/v1/clients`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reqObj)
                    });
                    const json = await res.json();
                    if (json.success) {
                        set(state => ({ clients: [json.data, ...state.clients] }));
                    }
                } catch(e) { console.error("API Error addClient", e); }
            },
            
            updateClient: async (id, updatedClient) => {
                // Optimistic UI update
                set((state) => {
                    const exists = state.clients.some(c => c.id === id);
                    if (exists) return { clients: state.clients.map(c => c.id === id ? { ...c, ...updatedClient } : c) };
                    return { clients: [{ ...updatedClient, id }, ...state.clients] };
                });
                try {
                     await fetch(`${API_BASE}/api/v1/clients/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: updatedClient.name,
                            contact: updatedClient.contact,
                            email: updatedClient.email,
                            phone: updatedClient.phone
                        })
                    });
                } catch(e) { console.error("API Error updateClient", e); }
            },
            
            deleteClient: async (id) => {
                // Optimistic UI update
                set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));
                try {
                    await fetch(`${API_BASE}/api/v1/clients/${id}`, { method: 'DELETE' });
                } catch(e) { console.error("API Error deleteClient", e); }
            },

            // Assets State
            folders: initialFolders,
            fetchFolders: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/folders`);
                    const json = await res.json();
                    if (json.success) set({ folders: json.data });
                } catch(e) { console.error(e); }
            },
            addFolder: async (folder) => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/folders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: folder.name, projectId: folder.projectId, parentId: folder.parentId || null })
                    });
                    const json = await res.json();
                    if (json.success) set(state => ({ folders: [json.data, ...state.folders] }));
                } catch(e) { console.error(e); }
            },
            deleteFolder: async (folderId) => {
                set((state) => ({ folders: state.folders.filter(f => f.id !== folderId) }));
                try {
                    await fetch(`${API_BASE}/api/v1/folders/${folderId}`, { method: 'DELETE' });
                } catch(e) { console.error(e); }
            },

            assets: initialAssets,
            setAssets: (assets) => set({ assets }),
            fetchAssets: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/assets`);
                    const json = await res.json();
                    if (json.success) set({ assets: json.data });
                } catch(e) { console.error(e); }
            },
            addAsset: async (asset) => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/assets`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: asset.name,
                            type: asset.type,
                            projectId: asset.projectId,
                            folderId: asset.folderId || null,
                            size: asset.size || null,
                            url: asset.url || null
                        })
                    });
                    const json = await res.json();
                    if (json.success) set(state => ({ assets: [json.data, ...state.assets] }));
                } catch(e) { console.error(e); }
            },
            deleteAsset: async (assetId) => {
                set((state) => ({ assets: state.assets.filter(a => a.id !== assetId) }));
                try {
                    await fetch(`${API_BASE}/api/v1/assets/${assetId}`, { method: 'DELETE' });
                } catch(e) { console.error(e); }
            },
            addAssetComment: async (assetId, comment) => {
                set((state) => ({
                    assets: state.assets.map(a => a.id === assetId ? { ...a, comments: [...(a.comments || []), comment] } : a)
                }));
                // Realistically, to sync this we'd GET the asset, mutate JSON, and PUT.
                const asset = get().assets.find(a => a.id === assetId);
                if (asset) {
                    try {
                        await fetch(`${API_BASE}/api/v1/assets/${assetId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ comments: [...(asset.comments || []), comment] })
                        });
                    } catch(e){}
                }
            },
            setAssetAsCover: async (projectId, assetId) => {
                set((state) => ({
                    assets: state.assets.map(a => {
                        if (a.projectId === projectId) {
                            // Remove cover flag from all others
                            let updatedComments = (a.comments || []).filter(c => c.type !== 'cover');
                            if (a.id === assetId) {
                                // Add cover flag to target
                                updatedComments.push({ type: 'cover', id: `cover-${Date.now()}` });
                            }
                            return { ...a, comments: updatedComments };
                        }
                        return a;
                    })
                }));
                // Try to persist to backend
                const projectAssets = get().assets.filter(a => a.projectId === projectId);
                for (const asset of projectAssets) {
                    let newComments = (asset.comments || []).filter(c => c.type !== 'cover');
                    if (asset.id === assetId) newComments.push({ type: 'cover', id: `cover-${Date.now()}` });
                    try {
                        await fetch(`${API_BASE}/api/v1/assets/${asset.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ comments: newComments })
                        });
                    } catch (e) { console.error('Failed to update cover', e); }
                }
            },
            addAnnotation: async (assetId, annotation) => {
                const newAnn = { ...annotation, id: `ann-${Date.now()}`, timestamp: new Date().toISOString(), status: 'open' };
                set((state) => ({
                    assets: state.assets.map(a => a.id === assetId ? { ...a, annotations: [...(a.annotations || []), newAnn] } : a)
                }));
                const asset = get().assets.find(a => a.id === assetId);
                if (asset) {
                    try {
                        await fetch(`${API_BASE}/api/v1/assets/${assetId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ annotations: [...(asset.annotations || []), newAnn] })
                        });
                    } catch(e){}
                }
            },
            resolveAnnotation: async (assetId, annotationId) => {
                set((state) => ({
                    assets: state.assets.map(a =>
                        a.id === assetId ? { ...a, annotations: (a.annotations || []).map(ann => ann.id === annotationId ? { ...ann, status: 'resolved' } : ann) } : a
                    )
                }));
                const asset = get().assets.find(a => a.id === assetId);
                if (asset) {
                    const newAnnotations = (asset.annotations || []).map(ann => ann.id === annotationId ? { ...ann, status: 'resolved' } : ann);
                    try {
                        await fetch(`${API_BASE}/api/v1/assets/${assetId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ annotations: newAnnotations })
                        });
                    } catch(e){}
                }
            },

            // Tasks State
            tasks: initialTasks,
            
            fetchTasks: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/tasks`);
                    const json = await res.json();
                    if (json.success) set({ tasks: json.data });
                } catch(e) { console.error("API Error fetchTasks", e); }
            },

            addTask: async (task) => {
                try {
                    const reqObj = {
                        title: task.title || 'Untitled Task',
                        assignee: task.assignee || 'Unassigned',
                        dueDate: task.dueDate || null,
                        priority: task.priority || 'Medium',
                        status: task.status || 'Pending',
                        projectId: task.projectId || null
                    };
                    const res = await fetch(`${API_BASE}/api/v1/tasks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reqObj)
                    });
                    const json = await res.json();
                    if (json.success) {
                        set(state => ({ tasks: [json.data, ...state.tasks] }));
                    }
                } catch(e) { console.error("API Error addTask", e); }
            },

            updateTaskStatus: async (id, newStatus) => {
                set((state) => {
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
                });
                try {
                    await fetch(`${API_BASE}/api/v1/tasks/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                } catch(e) { console.error("API Error updateTaskStatus", e); }
            },

            updateTask: async (id, updates) => {
                set((state) => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }));
                try {
                    await fetch(`${API_BASE}/api/v1/tasks/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                } catch(e) { console.error("API Error updateTask", e); }
            },

            deleteTask: async (id) => {
                set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));
                try {
                    await fetch(`${API_BASE}/api/v1/tasks/${id}`, { method: 'DELETE' });
                } catch(e) { console.error("API Error deleteTask", e); }
            },

            // Employees State
            employees: initialEmployees,
            fetchEmployees: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/employees`);
                    const json = await res.json();
                    if (json.success) set({ employees: json.data });
                } catch(e) { console.error(e); }
            },
            addEmployee: async (employee) => {
                try {
                    const res = await fetch(`${API_BASE}/api/auth/invite`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: employee.name,
                            email: employee.email,
                            role: employee.role
                        })
                    });
                    const json = await res.json();
                    if (json.success) {
                        // Optimistically re-fetch employees to get the mirrored Employee record
                        get().fetchEmployees();
                    } else {
                        console.error("Failed to invite user:", json.error);
                    }
                } catch(e) { console.error(e); }
            },
            updateEmployee: async (id, updates) => {
                set((state) => ({ employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e) }));
                try {
                    await fetch(`${API_BASE}/api/v1/employees/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                } catch(e) { console.error(e); }
            },
            deleteEmployee: async (id) => {
                set((state) => ({ employees: state.employees.filter(e => e.id !== id) }));
                try {
                    await fetch(`${API_BASE}/api/v1/employees/${id}`, { method: 'DELETE' });
                } catch(e) { console.error(e); }
            },

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
