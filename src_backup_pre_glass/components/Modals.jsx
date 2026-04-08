import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './Modals.css';
import { useStore } from '../store';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

export const AddProjectModal = ({ isOpen, onClose }) => {
    const { projects, addProject, clients, addClient } = useStore();
    const [formData, setFormData] = useState({
        reference: '',
        name: '',
        clientId: '',
        newClientName: '',
        newClientEmail: '',
        priority: 'Medium',
        stage: 'Queue',
        dueDate: '',
        assignee: 'Unassigned',
        totalAmount: '',
        deposit: ''
    });

    React.useEffect(() => {
        if (isOpen) {
            let maxNum = 2389; // Start at 2389 so next is 2390
            projects.forEach(p => {
                if (p.reference && p.reference.startsWith('PT')) {
                    const num = parseInt(p.reference.replace('PT', ''), 10);
                    if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                    }
                }
            });
            const nextNum = maxNum + 1;
            setFormData(prev => ({ ...prev, reference: `PT${nextNum}` }));
        }
    }, [isOpen, projects]);

    const handleSubmit = (e) => {
        e.preventDefault();

        let finalClientName = '';
        if (formData.clientId === 'new') {
            finalClientName = formData.newClientName;
            addClient({
                name: formData.newClientName,
                contact: 'Auto-Added',
                email: formData.newClientEmail,
                phone: '',
                activeProjects: 1,
                totalValue: `€${formData.totalAmount}`
            });
        } else {
            const existingClient = clients.find(c => c.id === formData.clientId);
            if (existingClient) finalClientName = existingClient.name || existingClient.companyName;
        }

        addProject({
            reference: formData.reference,
            name: formData.name,
            client: finalClientName,
            priority: formData.priority,
            status: formData.stage,
            dueDate: formData.dueDate,
            progress: 0,
            assignee: formData.assignee,
            totalAmount: Number(formData.totalAmount) || 0,
            deposit: Number(formData.deposit) || 0
        });

        setFormData({
            reference: '', name: '', clientId: '', newClientName: '', newClientEmail: '',
            priority: 'Medium', stage: 'Queue', dueDate: '', assignee: 'Unassigned',
            totalAmount: '', deposit: ''
        });
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants} style={{ maxWidth: 550 }}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">New Project</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Reference (PT Number)</label>
                                    <input type="text" className="modal-input text-secondary" required
                                        value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Client</label>
                                    <select className="modal-input" required
                                        value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                                        <option value="" disabled>Select a client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.companyName}</option>)}
                                        <option value="new">+ Create New Client</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Project Name</label>
                                <input type="text" className="modal-input" required
                                    style={{ fontSize: '1.05rem', padding: '0.8rem 1rem' }}
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            {formData.clientId === 'new' && (
                                <div className="form-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                                    <div className="form-group flex-1">
                                        <label>New Client Name</label>
                                        <input type="text" className="modal-input" required={formData.clientId === 'new'}
                                            value={formData.newClientName} onChange={e => setFormData({ ...formData, newClientName: e.target.value })} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Client Email</label>
                                        <input type="email" className="modal-input" required={formData.clientId === 'new'}
                                            value={formData.newClientEmail} onChange={e => setFormData({ ...formData, newClientEmail: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Assign Artist</label>
                                    <select className="modal-input" value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })}>
                                        <option value="Unassigned">Unassigned</option>
                                        <option value="Peter">Peter</option>
                                        <option value="Mirek">Mirek</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Priority</label>
                                    <select className="modal-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Total Price (€)</label>
                                    <input type="number" min="0" className="modal-input" required
                                        value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Deposit Paid (€)</label>
                                    <input type="number" min="0" className="modal-input" required
                                        value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Due Date</label>
                                    <input type="date" className="modal-input" required
                                        value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </div>

                            <p className="text-secondary text-sm mt-2" style={{ fontStyle: 'italic' }}>
                                Note: First drafts typically require 7-10 days. The client will be notified.
                            </p>

                            <div className="modal-footer mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Project</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const AddClientModal = ({ isOpen, onClose, client }) => {
    const addClient = useStore(state => state.addClient);
    const updateClient = useStore(state => state.updateClient);
    const [formData, setFormData] = useState({
        name: client ? client.name || client.companyName || '' : '',
        contact: client ? client.contact || '' : '',
        email: client ? client.email || '' : '',
        phone: client ? client.phone || '' : ''
    });

    React.useEffect(() => {
        if (isOpen && client) {
            setFormData({
                name: client.name || client.companyName || '',
                contact: client.contact || '',
                email: client.email || '',
                phone: client.phone || ''
            });
        } else if (isOpen && !client) {
            setFormData({ name: '', contact: '', email: '', phone: '' });
        }
    }, [isOpen, client]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (client) {
            updateClient(client.id, {
                ...client,
                name: formData.name,
                contact: formData.contact,
                email: formData.email,
                phone: formData.phone
            });
        } else {
            addClient({
                name: formData.name,
                contact: formData.contact,
                email: formData.email,
                phone: formData.phone,
                activeProjects: 0,
                totalValue: '€0'
            });
        }
        setFormData({ name: '', contact: '', email: '', phone: '' });
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">{client ? 'Edit Client' : 'New Client'}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" className="modal-input" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Primary Contact</label>
                                <input type="text" className="modal-input" required
                                    value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Email Address</label>
                                    <input type="email" className="modal-input" required
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Phone Number</label>
                                    <input type="tel" className="modal-input"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{client ? 'Save Changes' : 'Add Client'}</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
export const AddLeadModal = ({ isOpen, onClose }) => {
    const addLead = useStore(state => state.addLead);
    const [formData, setFormData] = useState({ client: '', projectCount: 1, value: '€0', added: 'Just Now' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addLead({
            client: formData.client,
            projectCount: parseInt(formData.projectCount, 10),
            value: formData.value,
            added: formData.added
        });
        setFormData({ client: '', projectCount: 1, value: '€0', added: 'Just Now' });
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">New Lead</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Client / Prospect Name</label>
                                <input type="text" className="modal-input" required
                                    value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Estimated Value</label>
                                    <input type="text" className="modal-input" placeholder="€5,000" required
                                        value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Project Count</label>
                                    <input type="number" min="1" className="modal-input" required
                                        value={formData.projectCount} onChange={e => setFormData({ ...formData, projectCount: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Lead</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const AddUserModal = ({ isOpen, onClose }) => {
    const addEmployee = useStore(state => state.addEmployee);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'employee' });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Generate initials automatically
        const parts = formData.name.trim().split(' ');
        let initials = parts[0].substring(0, 1).toUpperCase();
        if (parts.length > 1) {
            initials += parts[parts.length - 1].substring(0, 1).toUpperCase();
        } else if (parts[0].length > 1) {
            initials += parts[0].substring(1, 2).toUpperCase();
        }

        addEmployee({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            initials: initials
        });

        setFormData({ name: '', email: '', role: 'employee' });
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">Add New User</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" className="modal-input" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="modal-input" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role / Permissions</label>
                                <select className="modal-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">Employee (Standard Access)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                    <option value="client">Client (Restricted View)</option>
                                </select>
                            </div>
                            <div className="modal-footer mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Send Invite</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const ClientDetailsModal = ({ isOpen, onClose, client, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', phone: '' });

    React.useEffect(() => {
        if (client && isOpen) {
            setFormData({
                name: client.name || '',
                contact: client.contact || '',
                email: client.email || '',
                phone: client.phone || ''
            });
            setIsEditing(false);
        }
    }, [client, isOpen]);

    if (!client) return null;

    const handleSave = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave({ ...client, ...formData });
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
            if (onDelete) onDelete(client.id);
            onClose();
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">{isEditing ? 'Edit Client' : 'Client Details'}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Company Name</label>
                                {isEditing ? (
                                    <input type="text" className="modal-input" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                ) : (
                                    <div className="p-3 bg-dark border border-glass rounded font-medium text-white">{client.name}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Primary Contact</label>
                                {isEditing ? (
                                    <input type="text" className="modal-input" required
                                        value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                ) : (
                                    <div className="p-3 bg-dark border border-glass rounded">{client.contact}</div>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Email Address</label>
                                    {isEditing ? (
                                        <input type="email" className="modal-input" required
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    ) : (
                                        <div className="p-3 bg-dark border border-glass rounded text-secondary">{client.email}</div>
                                    )}
                                </div>
                                <div className="form-group flex-1">
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input type="tel" className="modal-input"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    ) : (
                                        <div className="p-3 bg-dark border border-glass rounded text-secondary">{client.phone}</div>
                                    )}
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="form-row mt-4 pt-4 border-t border-glass">
                                    <div className="form-group flex-1">
                                        <label>Active Projects</label>
                                        <div className="text-xl font-semibold text-white">{client.activeProjects}</div>
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Total Value</label>
                                        <div className="text-xl font-semibold text-accent-cyan">{client.totalValue}</div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer mt-6" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                {isEditing ? (
                                    <>
                                        <button type="button" className="btn btn-ghost text-red-500 hover:text-white hover:bg-red-500 hover:bg-opacity-20 transition-colors" onClick={handleDelete}>Delete Client</button>
                                        <div className="flex gap-3">
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Save Changes</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div />
                                        <button type="button" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>Edit Client Details</button>
                                    </>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const EditTaskModal = ({ isOpen, onClose, task }) => {
    const { employees, projects: allProjects, userRole } = useStore();
    const [formData, setFormData] = useState({
        title: '',
        assignee: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
        projectId: ''
    });

    React.useEffect(() => {
        if (task && isOpen) {
            setFormData({
                title: task.title || '',
                assignee: task.assignee || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', // Format for date input (YYYY-MM-DD)
                priority: task.priority || 'Medium',
                status: task.status || 'Pending',
                projectId: task.projectId || ''
            });
        }
    }, [task, isOpen]);

    if (!task) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        useStore.setState((state) => ({
            tasks: state.tasks.map(t =>
                t.id === task.id ? {
                    ...t,
                    title: formData.title,
                    assignee: formData.assignee,
                    // Persist ISO string format for date
                    dueDate: new Date(formData.dueDate).toISOString(),
                    priority: formData.priority,
                    status: formData.status,
                    projectId: formData.projectId || null
                } : t
            )
        }));
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
                    <motion.div className="modal-card glass-panel" variants={modalVariants}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold">Edit Task</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Task Title</label>
                                <input type="text" className="modal-input" required autoFocus
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Assignee</label>
                                    <select className="modal-input" value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })} disabled={userRole !== 'admin' && formData.assignee !== useStore.getState().currentUser?.name}>
                                        <option value="Unassigned">Unassigned</option>
                                        <option value="Peter">Peter</option>
                                        <option value="Mirek">Mirek</option>
                                        <option value="Elena">Elena</option>
                                        <option value="Koss">Koss</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Due Date</label>
                                    <input type="date" className="modal-input" required
                                        value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Associated Project <span className="text-[var(--text-tertiary)] font-normal ml-1">(Optional)</span></label>
                                <select className="modal-input" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                                    <option value="">None (General Task)</option>
                                    {allProjects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.reference} - {p.name} ({p.client})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Priority</label>
                                    <select className="modal-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Status</label>
                                    <select className="modal-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Task</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
