import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building, Upload, MessageSquare, Clock, CheckCircle, Circle, FileText, X, Image as ImageIcon, Eye, FolderArchive, FileArchive, Download, Grid, List } from 'lucide-react';
import ProjectFolders from '../components/ProjectFolders';
import './ProjectDetails.css';

const PREDEFINED_SERVICES = [
    { id: 'ext_renders', name: 'Exterior Renders (Day and/or Night)' },
    { id: 'int_renders', name: 'Interior Renders' },
    { id: 'ext_anim', name: 'Exterior Animation' },
    { id: 'int_anim', name: 'Interior Animation' },
    { id: 'floor_3d', name: '3D Floorplans' },
    { id: 'floor_2d', name: '2D Floorplans' }
];

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, clients, employees, userRole, currentUser, updateProjectStatus, addProjectFeedback, updateProjectField } = useStore();
    const { t } = useTranslation();
    const [feedbackText, setFeedbackText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [viewMode, setViewMode] = useState('list');

    const project = projects.find(p => p.id === id);

    if (!project) {
        return <div className="p-8 text-center"><h2 className="text-xl">Project not found</h2><button className="btn mt-4" onClick={() => navigate(-1)}>Go Back</button></div>;
    }

    // Access check
    if (userRole === 'client' && project.client !== currentUser.name) {
        return <div className="p-8 text-center text-danger"><h2 className="text-xl">Access Denied</h2></div>;
    }

    if (userRole === 'employee' && !project.assignee.includes(currentUser.name?.substring(0, 2).toUpperCase())) {
        return <div className="p-8 text-center text-danger"><h2 className="text-xl">Not assigned to you</h2></div>;
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files.map(f => f.name)]);
    };

    const submitFeedback = (e) => {
        e.preventDefault();
        if (!feedbackText.trim() && attachments.length === 0) return;

        addProjectFeedback(project.id, {
            notes: feedbackText,
            files: attachments,
            author: currentUser.name
        });

        setFeedbackText('');
        setAttachments([]);
    };

    const renderStatusWorkflow = () => {
        const stages = ['Queue', 'Modeling', 'Drafting', 'Client Review', 'Revising', 'Completed'];
        const currentIndex = stages.indexOf(project.status.replace('Revising', 'Drafting')); // Simplify logic

        return (
            <div className="dashboard-module glass-panel mb-6">
                <div className="section-header">
                    <h2 className="section-title">{t('production_workflow', 'Production Workflow')}</h2>
                </div>
                <div className="workflow-grid" style={{ padding: '1.5rem' }}>
                    {stages.map((stage, i) => {
                        let statusClass = 'pending';
                        if (project.status === stage) statusClass = 'current';
                        else if (i < currentIndex || project.status === 'Completed') statusClass = 'completed';

                        if (stage === 'Revising' && project.revisionCount === 0 && project.status !== 'Revising') return null;

                        const isClickable = userRole === 'admin';
                        return (
                            <motion.div
                                key={stage}
                                className={`workflow-block ${statusClass} ${isClickable ? 'clickable' : ''}`}
                                onClick={() => isClickable && updateProjectStatus(project.id, stage)}
                                whileHover={isClickable ? { y: -2 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                <div className="block-icon-wrapper">
                                    {statusClass === 'current' && stage === 'Completed' ? (
                                        <div className="relative flex items-center justify-center w-8 h-8">
                                            <div className="absolute inset-0 border-2 border-[var(--accent-cyan)] rounded-full animate-ping opacity-20"></div>
                                            <div className="absolute inset-0 border-2 border-[var(--accent-cyan)] rounded-full"></div>
                                            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]"></div>
                                        </div>
                                    ) : (
                                        statusClass === 'completed' ? <CheckCircle size={20} /> : <div className="dot" />
                                    )}
                                </div>
                                <span className="block-label">{t(`stage_${stage.toLowerCase().replace(' ', '_')}`, stage)}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="project-header-container">
                <div className="project-header-left">
                    <button
                        className="flex items-center gap-2 text-sm text-white bg-slate-800 border border-white/10 rounded-lg cursor-pointer px-4 py-2 hover:bg-slate-700 hover:border-white/20 transition-all self-start"
                        onClick={() => navigate('/assets')}
                    >
                        <ArrowLeft size={16} /> Back to Hub
                    </button>
                    <div>
                        <div className="project-title-row">
                            <h1 className="project-title flex items-baseline gap-3">
                                {project.reference && (
                                    <span className="text-[var(--accent-cyan)] font-bold">
                                        {project.reference}
                                    </span>
                                )}
                                <span>{project.name}</span>
                            </h1>
                        </div>
                        <p className="project-subtitle flex items-center">
                            <Building size={14} />
                            <span
                                className="cursor-pointer hover:text-[var(--accent-cyan)] transition-colors ml-1"
                                onClick={() => {
                                    const clientObj = clients.find(c => c.name === project.client);
                                    if (clientObj) {
                                        navigate(`/client/${clientObj.id}`);
                                    } else {
                                        navigate('/clients');
                                    }
                                }}
                            >
                                {project.client}
                            </span>
                            &nbsp;&bull;&nbsp; <Clock size={14} /> Due: {project.dueDate}
                        </p>
                    </div>
                </div>

                <div className="project-header-actions">
                    {project.revisionCount > 0 && (
                        <div className="badge badge-warning">Revision #{project.revisionCount}</div>
                    )}
                    {userRole === 'admin' && (
                        <div className="text-[var(--text-primary)] font-medium text-sm">
                            Balance: <span className={project.balance > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}>€{project.balance}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="content-grid">
                <div className="main-col">
                    {renderStatusWorkflow()}

                    {/* Project Hub */}
                    <div className="dashboard-module glass-panel mt-6">
                        <ProjectFolders projectId={project.id} />
                    </div>
                </div>

                <div className="side-col">
                    <div className="dashboard-module glass-panel text-sm w-full">
                        <div className="section-header">
                            <h2 className="section-title">{t('project_details', 'Project Details')}</h2>
                        </div>
                        <div className="space-y-3" style={{ padding: '1.5rem' }}>
                            <div className="detail-row">
                                <span className="detail-label">{t('assigned_artist', 'Assigned Artist')}</span>
                                {userRole === 'admin' ? (
                                    <select
                                        className="admin-select"
                                        value={project.assignee}
                                        onChange={(e) => updateProjectField(project.id, 'assignee', e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{emp.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="detail-value">{project.assignee || t('unassigned', 'Unassigned')}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t('delivery_date', 'Delivery Date')}</span>
                                {userRole === 'admin' ? (
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const dateObj = new Date(e.target.value);
                                            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            updateProjectField(project.id, 'dueDate', formattedDate);
                                        }}
                                    />
                                ) : (
                                    <span className="detail-value">{project.dueDate}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t('priority', 'Priority')}</span>
                                {userRole === 'admin' ? (
                                    <select
                                        className="admin-select text-warning"
                                        value={project.priority || 'Medium'}
                                        onChange={(e) => updateProjectField(project.id, 'priority', e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                ) : (
                                    <span className="detail-value text-warning">{project.priority || 'Medium'}</span>
                                )}
                            </div>

                            {userRole === 'admin' && (
                                <>
                                    <div className="detail-row mt-4 pt-4 border-t border-glass">
                                        <span className="detail-label">{t('total_value', 'Total Value')}</span>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">€</span>
                                            <input
                                                type="number"
                                                className="admin-input pl-6 w-24"
                                                value={project.totalAmount || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    updateProjectField(project.id, 'totalAmount', val);
                                                    updateProjectField(project.id, 'balance', val - (project.deposit || 0));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">{t('deposit_paid', 'Deposit Paid')}</span>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">€</span>
                                            <input
                                                type="number"
                                                className="admin-input pl-6 w-24"
                                                value={project.deposit || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    updateProjectField(project.id, 'deposit', val);
                                                    updateProjectField(project.id, 'balance', (project.totalAmount || 0) - val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">{t('outstanding_balance', 'Outstanding Balance')}</span>
                                        <span className={`detail-value ${project.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                            €{project.balance?.toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Services & Deliverables */}
                    <div className="dashboard-module glass-panel text-sm w-full mt-6">
                        <div className="section-header">
                            <h2 className="section-title">{t('services_deliverables', 'Services & Deliverables')}</h2>
                        </div>
                        <div className="space-y-4" style={{ padding: '1.5rem' }}>
                            {PREDEFINED_SERVICES.map(svc => {
                                const current = (project.services || {})[svc.id] || { selected: false, notes: '' };
                                return (
                                    <div key={svc.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 transition-all">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${current.selected ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>{svc.name}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={current.selected} onChange={() => {
                                                    const currentServices = project.services || {};
                                                    const service = currentServices[svc.id] || { selected: false, notes: '' };
                                                    updateProjectField(project.id, 'services', { ...currentServices, [svc.id]: { ...service, selected: !service.selected } });
                                                }} disabled={userRole === 'client'} />
                                                <div className="w-9 h-5 bg-[var(--bg-primary)] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-cyan)] peer-checked:border-transparent cursor-pointer"></div>
                                            </label>
                                        </div>
                                        {current.selected && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex flex-col gap-3">
                                                <textarea 
                                                    className="w-full text-xs p-2 rounded bg-[var(--bg-primary)] border border-white/5 focus:border-[var(--accent-cyan)]/50 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none outline-none transition-all"
                                                    placeholder={t('add_notes_optional', 'Add notes for this service (optional)...')}
                                                    rows="2"
                                                    value={current.notes}
                                                    onChange={e => {
                                                        const currentServices = project.services || {};
                                                        const service = currentServices[svc.id] || { selected: false, notes: '', completed: false };
                                                        updateProjectField(project.id, 'services', { ...currentServices, [svc.id]: { ...service, notes: e.target.value } });
                                                    }}
                                                    disabled={userRole === 'client'}
                                                />
                                                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${current.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {current.completed ? t('status_completed', 'STATUS: COMPLETED') : t('status_in_progress', 'STATUS: IN PROGRESS')}
                                                    </span>
                                                    <button 
                                                        onClick={() => {
                                                            const currentServices = project.services || {};
                                                            const service = currentServices[svc.id] || { selected: false, notes: '', completed: false };
                                                            updateProjectField(project.id, 'services', { ...currentServices, [svc.id]: { ...service, completed: !service.completed } });
                                                        }}
                                                        className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${current.completed ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'}`}
                                                        disabled={userRole === 'client'}
                                                    >
                                                        {current.completed ? <CheckCircle size={14} className="mr-1.5"/> : <Circle size={14} className="mr-1.5"/>}
                                                        {current.completed ? t('completed', 'Completed') : t('mark_complete', 'Mark Complete')}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetails;
