import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calendar, Clock, DollarSign, UploadCloud, FolderCheck, Briefcase, Mail, Phone, Trash2 } from 'lucide-react';
import './Modals.css';
import { useStore } from '../store';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

export const AddProjectModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
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
            let maxNum = 2399; // Start at 2399 so next is 2400
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
            clientId: formData.clientId === 'new' ? undefined : formData.clientId,
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
                            <h2 className="text-xl font-semibold">{t('new_project', 'New Project')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('reference_pt_number', 'Reference (PT Number)')}</label>
                                    <input type="text" className="modal-input text-secondary" required
                                        value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('client', 'Client')}</label>
                                    <select className="modal-input" required
                                        value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                                        <option value="" disabled>{t('select_client', 'Select a client...')}</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.companyName}</option>)}
                                        <option value="new">+ {t('create_new_client', 'Create New Client')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('project_name_label', 'Project Name')}</label>
                                <input type="text" className="modal-input" required
                                    style={{ fontSize: '1.05rem', padding: '0.8rem 1rem' }}
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            {formData.clientId === 'new' && (
                                <div className="form-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                                    <div className="form-group flex-1">
                                        <label>{t('new_client_name', 'New Client Name')}</label>
                                        <input type="text" className="modal-input" required={formData.clientId === 'new'}
                                            value={formData.newClientName} onChange={e => setFormData({ ...formData, newClientName: e.target.value })} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>{t('client_email', 'Client Email')}</label>
                                        <input type="email" className="modal-input" required={formData.clientId === 'new'}
                                            value={formData.newClientEmail} onChange={e => setFormData({ ...formData, newClientEmail: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('assign_artist', 'Assign Artist')}</label>
                                    <select className="modal-input" value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })}>
                                        <option value="Unassigned">{t('unassigned', 'Unassigned')}</option>
                                        <option value="Peter">Peter</option>
                                        <option value="Mirek">Mirek</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('priority', 'Priority')}</label>
                                    <select className="modal-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option>{t('low', 'Low')}</option>
                                        <option>{t('medium', 'Medium')}</option>
                                        <option>{t('high', 'High')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('total_price_eur', 'Total Price (€)')}</label>
                                    <input type="number" min="0" className="modal-input" required
                                        value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('deposit_paid_eur', 'Deposit Paid (€)')}</label>
                                    <input type="number" min="0" className="modal-input" required
                                        value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('due_date', 'Due Date')}</label>
                                    <input type="date" className="modal-input" required
                                        value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </div>

                            <p className="text-secondary text-sm mt-2" style={{ fontStyle: 'italic' }}>
                                {t('first_drafts_note', 'Note: First drafts typically require 7-10 days. The client will be notified.')}
                            </p>

                            <div className="modal-footer mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel', 'Cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('create_project', 'Create Project')}</button>
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
    const { t } = useTranslation();
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
                            <h2 className="text-xl font-semibold">{client ? t('edit_client', 'Edit Client') : t('new_client', 'New Client')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('company_name', 'Company Name')}</label>
                                <input type="text" className="modal-input" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>{t('primary_contact', 'Primary Contact')}</label>
                                <input type="text" className="modal-input" required
                                    value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('email_address', 'Email Address')}</label>
                                    <input type="email" className="modal-input" required
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('phone_number', 'Phone Number')}</label>
                                    <input type="tel" className="modal-input"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel', 'Cancel')}</button>
                                <button type="submit" className="btn btn-primary">{client ? t('save_changes', 'Save Changes') : t('add_client_button', 'Add Client')}</button>
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
    const { t } = useTranslation();
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
                            <h2 className="text-xl font-semibold">{t('new_lead', 'New Lead')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('client_prospect_name', 'Client / Prospect Name')}</label>
                                <input type="text" className="modal-input" required
                                    value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('estimated_value', 'Estimated Value')}</label>
                                    <input type="text" className="modal-input" placeholder="€5,000" required
                                        value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('project_count', 'Project Count')}</label>
                                    <input type="number" min="1" className="modal-input" required
                                        value={formData.projectCount} onChange={e => setFormData({ ...formData, projectCount: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel', 'Cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('add_lead_button', 'Add Lead')}</button>
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
    const { t } = useTranslation();
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
                            <h2 className="text-xl font-semibold">{t('add_new_user', 'Add New User')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('full_name', 'Full Name')}</label>
                                <input type="text" className="modal-input" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>{t('email_address', 'Email Address')}</label>
                                <input type="email" className="modal-input" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>{t('role_permissions', 'Role / Permissions')}</label>
                                <select className="modal-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">{t('employee_access', 'Employee (Standard Access)')}</option>
                                    <option value="admin">{t('admin_access', 'Admin (Full Access)')}</option>
                                    <option value="client">{t('client_access', 'Client (Restricted View)')}</option>
                                </select>
                            </div>
                            <div className="modal-footer mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel', 'Cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('send_invite', 'Send Invite')}</button>
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
    const { t } = useTranslation();
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
        if (window.confirm(t('confirm_delete_client', 'Are you sure you want to delete {{name}}?', { name: client.name }))) {
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
                            <h2 className="text-xl font-semibold">{isEditing ? t('edit_client', 'Edit Client') : t('client_details', 'Client Details')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group">
                                <label>{t('company_name', 'Company Name')}</label>
                                {isEditing ? (
                                    <input type="text" className="modal-input" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                ) : (
                                    <div className="p-3 bg-dark border border-glass rounded font-medium text-white">{client.name}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>{t('primary_contact', 'Primary Contact')}</label>
                                {isEditing ? (
                                    <input type="text" className="modal-input" required
                                        value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                ) : (
                                    <div className="p-3 bg-dark border border-glass rounded">{client.contact}</div>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('email_address', 'Email Address')}</label>
                                    {isEditing ? (
                                        <input type="email" className="modal-input" required
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    ) : (
                                        <div className="p-3 bg-dark border border-glass rounded text-secondary">{client.email}</div>
                                    )}
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('phone_number', 'Phone Number')}</label>
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
                                        <label>{t('active_projects', 'Active Projects')}</label>
                                        <div className="text-xl font-semibold text-white">{client.activeProjects}</div>
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>{t('total_value', 'Total Value')}</label>
                                        <div className="text-xl font-semibold text-accent-cyan">{client.totalValue}</div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer mt-6" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                {isEditing ? (
                                    <>
                                        <button type="button" className="btn btn-ghost text-red-500 hover:text-white hover:bg-red-500 hover:bg-opacity-20 transition-colors" onClick={handleDelete}>{t('delete_client', 'Delete Client')}</button>
                                        <div className="flex gap-3">
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>{t('cancel', 'Cancel')}</button>
                                            <button type="submit" className="btn btn-primary">{t('save_changes', 'Save Changes')}</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div />
                                        <button type="button" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>{t('edit_client_details', 'Edit Client Details')}</button>
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
    const { t } = useTranslation();
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
                            <h2 className="text-xl font-semibold">{t('edit_task', 'Edit Task')}</h2>
                            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('task_title', 'Task Title')}</label>
                                <input type="text" className="modal-input" required autoFocus
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('assignee', 'Assignee')}</label>
                                    <select className="modal-input" value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })} disabled={userRole !== 'admin' && formData.assignee !== useStore.getState().currentUser?.name}>
                                        <option value="Unassigned">{t('unassigned', 'Unassigned')}</option>
                                        <option value="Peter">Peter</option>
                                        <option value="Mirek">Mirek</option>
                                        <option value="Elena">Elena</option>
                                        <option value="Koss">Koss</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('due_date', 'Due Date')}</label>
                                    <input type="date" className="modal-input" required
                                        value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('associated_project', 'Associated Project')} <span className="text-[var(--text-tertiary)] font-normal ml-1">({t('optional', 'Optional')})</span></label>
                                <select className="modal-input" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                                    <option value="">{t('none_general_task', 'None (General Task)')}</option>
                                    {allProjects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.reference} - {p.name} ({p.client})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>{t('priority', 'Priority')}</label>
                                    <select className="modal-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="Low">{t('low', 'Low')}</option>
                                        <option value="Medium">{t('medium', 'Medium')}</option>
                                        <option value="High">{t('high', 'High')}</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('status', 'Status')}</label>
                                    <select className="modal-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Pending">{t('pending', 'Pending')}</option>
                                        <option value="Completed">{t('completed', 'Completed')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer mt-6" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <button
                                    type="button" 
                                    className="btn btn-ghost text-red-500 hover:text-white hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (window.confirm("Are you sure you want to delete this task?")) {
                                            useStore.getState().deleteTask(task.id);
                                            onClose();
                                        }
                                    }}
                                >
                                    {t('delete_task', 'Delete Task')}
                                </button>
                                <div className="flex gap-3">
                                    <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel', 'Cancel')}</button>
                                    <button type="submit" className="btn btn-primary">{t('save_task', 'Save Task')}</button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const DeleteClientModal = ({ isOpen, onClose, onConfirm, clientName }) => {
    const { t } = useTranslation();
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-full flex items-center justify-center">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">{t('delete_client', 'Delete Client')}</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                            {t('confirm_delete_client_desc', 'Are you sure you want to delete "{{clientName}}"? This action cannot be undone.', { clientName })}
                        </p>
                        <div className="flex gap-3 justify-end mt-2">
                            <button
                                className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm"
                                onClick={onClose}
                            >
                                {t('cancel', 'Cancel')}
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium text-sm"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                {t('delete', 'Delete')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
