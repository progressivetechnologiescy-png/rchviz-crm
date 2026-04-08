import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building, Upload, MessageSquare, Clock, CheckCircle, FileText, X, Image as ImageIcon, Eye, FolderArchive, FileArchive, Download, Grid, List } from 'lucide-react';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, clients, userRole, currentUser, updateProjectStatus, addProjectFeedback, updateProjectField } = useStore();
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
                    <h2 className="section-title">Production Workflow</h2>
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
                                <span className="block-label">{stage}</span>
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
                        className="back-btn"
                        onClick={() => navigate('/assets')}
                    >
                        <ArrowLeft size={16} /> Back to Hub
                    </button>
                    <div>
                        <div className="project-title-row">
                            {project.reference && (
                                <span className="text-[11px] font-mono bg-[#2A2D35] text-[var(--accent-cyan)] font-medium px-2 py-0.5 rounded border border-[#3A3D45] flex items-center justify-center -ml-1 h-fit leading-none mt-1 box-border">
                                    {project.reference}
                                </span>
                            )}
                            <h1 className="project-title">{project.name}</h1>
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
                        <div className="badge badge-success">Balance: €{project.balance}</div>
                    )}
                </div>
            </header>

            <div className="content-grid">
                <div className="main-col">
                    {renderStatusWorkflow()}

                    {/* Project Hub */}
                    <div className="dashboard-module glass-panel mt-6">
                        <div className="section-header">
                            <h2 className="section-title flex items-center gap-2">
                                <ImageIcon size={18} /> Project Hub: Revisions & Deliverables
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Annotated render block */}
                            <div className="render-annotator">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Eye size={16} /> Current Render Review</h3>
                                <div className="relative rounded-xl overflow-hidden border border-[var(--glass-border)] group bg-[var(--bg-secondary)]">
                                    {/* Placeholder Image */}
                                    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" alt="Current Render" className="w-full h-[300px] object-cover opacity-80 transition-opacity group-hover:opacity-100" />

                                    {/* Annotations overlay */}
                                    <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-accent-cyan rounded-full flex items-center justify-center text-dark text-xs font-bold cursor-pointer ring-4 ring-accent-cyan/30 shadow-lg transform transition hover:scale-110">1</div>
                                    <div className="absolute top-[45%] right-1/4 w-6 h-6 bg-accent-cyan rounded-full flex items-center justify-center text-dark text-xs font-bold cursor-pointer ring-4 ring-accent-cyan/30 shadow-lg transform transition hover:scale-110">2</div>

                                    <div className="absolute bottom-4 left-4 right-4 bg-[var(--bg-secondary)]/80 backdrop-blur-md p-3 rounded-lg text-xs border border-[var(--glass-border)]/50 shadow-2xl">
                                        <div className="font-semibold text-[var(--text-primary)] mb-2 flex justify-between">
                                            <span>Active Annotations</span>
                                            <span className="text-accent-cyan">Add Note +</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-secondary flex gap-2"><span className="text-accent-cyan font-bold">1.</span> Adjust lighting temperature to be warmer (3200K)</div>
                                            <div className="text-secondary flex gap-2"><span className="text-accent-cyan font-bold">2.</span> Change floor material to matte black marble</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File System Block */}
                            <div className="deliverables-system flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><FolderArchive size={16} /> Deliverable Packages</h3>
                                    <div className="flex bg-[var(--bg-secondary)]/40 rounded-lg p-1 border border-[var(--glass-border)]/30">
                                        <button
                                            className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--hover-bg)] text-[var(--text-primary)] shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                            onClick={() => setViewMode('list')}
                                        ><List size={14} /></button>
                                        <button
                                            className={`p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--hover-bg)] text-[var(--text-primary)] shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                            onClick={() => setViewMode('grid')}
                                        ><Grid size={14} /></button>
                                    </div>
                                </div>

                                {viewMode === 'list' ? (
                                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-3 flex-1">
                                        <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/40 rounded-lg border border-[var(--glass-border)]/50 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
                                                    <FileArchive size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--text-primary)] text-sm tracking-wide">Draft_V2_Textures.zip</div>
                                                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">320 MB • Uploaded 2h ago by Admin</div>
                                                </div>
                                            </div>
                                            <button className="p-2 text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/40 rounded-lg border border-[var(--glass-border)]/50 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                                    <FileArchive size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--text-primary)] text-sm tracking-wide">Final_Renders.zip</div>
                                                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">1.2 GB • Uploaded yesterday</div>
                                                </div>
                                            </div>
                                            <button className="p-2 text-secondary hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div className="bg-[var(--bg-secondary)]/40 border border-[var(--glass-border)]/50 rounded-xl p-4 hover:bg-[var(--input-bg)] transition-colors cursor-pointer flex flex-col items-center text-center">
                                            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-purple-400 rounded-xl shadow-lg border border-purple-500/30 mb-3">
                                                <FileArchive size={32} />
                                            </div>
                                            <div className="font-medium text-[var(--text-primary)] text-sm tracking-wide w-full truncate">Draft_V2_Textures.zip</div>
                                            <div className="text-[11px] text-[var(--text-secondary)] mt-1">320 MB</div>
                                            <button className="mt-3 w-full py-1.5 text-xs font-semibold bg-[var(--input-bg)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--glass-border)] flex items-center justify-center gap-1.5">
                                                <Download size={12} /> Download
                                            </button>
                                        </div>
                                        <div className="bg-[var(--bg-secondary)]/40 border border-[var(--glass-border)]/50 rounded-xl p-4 hover:bg-[var(--input-bg)] transition-colors cursor-pointer flex flex-col items-center text-center">
                                            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-xl shadow-lg border border-emerald-500/30 mb-3">
                                                <FileArchive size={32} />
                                            </div>
                                            <div className="font-medium text-[var(--text-primary)] text-sm tracking-wide w-full truncate">Final_Renders.zip</div>
                                            <div className="text-[11px] text-[var(--text-secondary)] mt-1">1.2 GB</div>
                                            <button className="mt-3 w-full py-1.5 text-xs font-semibold bg-[var(--input-bg)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--glass-border)] flex items-center justify-center gap-1.5">
                                                <Download size={12} /> Download
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button className="mt-4 w-full btn btn-secondary flex items-center justify-center gap-2 py-3 border-dashed">
                                    <Upload size={16} /> Drop new deliverables package here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="side-col">
                    <div className="dashboard-module glass-panel text-sm w-full">
                        <div className="section-header">
                            <h2 className="section-title">Project Details</h2>
                        </div>
                        <div className="space-y-3" style={{ padding: '1.5rem' }}>
                            <div className="detail-row">
                                <span className="detail-label">Assigned Artist</span>
                                {userRole === 'admin' ? (
                                    <select
                                        className="admin-select"
                                        value={project.assignee}
                                        onChange={(e) => updateProjectField(project.id, 'assignee', e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {Array.from(new Set(projects.map(p => p.assignee).filter(Boolean))).map(emp => (
                                            <option key={emp} value={emp} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{emp}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="detail-value">{project.assignee || 'Unassigned'}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Delivery Date</span>
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
                                <span className="detail-label">Priority</span>
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
                                        <span className="detail-label">Total Value</span>
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
                                        <span className="detail-label">Deposit Paid</span>
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
                                        <span className="detail-label">Outstanding Balance</span>
                                        <span className={`detail-value ${project.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                            €{project.balance?.toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetails;
