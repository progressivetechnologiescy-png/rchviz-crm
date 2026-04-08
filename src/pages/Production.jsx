import React, { useState } from 'react';
import './Production.css';
import { Filter, CheckCircle2, CircleDashed, Clock, Plus, MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { AddProjectModal } from '../components/Modals';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
};

const STAGES = ['Queue', 'Modeling', 'Drafting', 'Client Review', 'Revising', 'Completed'];

const getPriorityIcon = (priority) => {
    if (priority === 'High') return <CheckCircle2 className="text-danger" size={14} />;
    if (priority === 'Medium') return <Clock className="text-warning" size={14} />;
    return <CircleDashed className="text-info" size={14} />;
};

const KanbanCard = ({ project, onDragStart }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="kanban-card glass-panel cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, project.id)}
            onClick={() => navigate(`/project/${project.id}`)}
            whileHover={{ y: -2, backgroundColor: 'var(--hover-bg)' }}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--input-bg)] px-2 py-0.5 rounded">{project.reference}</span>
                {getPriorityIcon(project.priority || "Medium")}
            </div>
            <h4 className="font-semibold text-[var(--text-primary)] leading-tight mb-3">{project.name}</h4>

            <div className="flex justify-between items-end mt-auto pt-2 border-t border-[var(--glass-border)]">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <MessageSquare size={14} />
                    <span className="text-xs font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                </div>

                <div className="flex items-center">
                    <div className="px-2 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex justify-center items-center text-[10px] font-medium text-accent-cyan truncate max-w-[80px]" title={`Assigned to ${project.assignee || 'Unknown'}`}>
                        {project.assignee || 'Unassigned'}
                    </div>
                </div>
            </div>

            {project.status === 'Completed' && (
                <div className="absolute top-0 right-0 w-full h-full border-2 border-success/30 rounded-xl pointer-events-none" />
            )}
        </motion.div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red', background: '#222', minHeight: '100vh', width: '100vw' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ color: 'white' }}>{this.state.error && this.state.error.toString()}</pre>
                    <pre style={{ color: 'gray', fontSize: '12px' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const ProductionUI = () => {
    const { t } = useTranslation();
    const projects = useStore(state => state.projects);
    const updateProjectStatus = useStore(state => state.updateProjectStatus);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    // Drag state
    const [draggedProjectId, setDraggedProjectId] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);

    const handleDragStart = (e, id) => {
        setDraggedProjectId(id);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);

        // Ghost image styling (optional, browser handles default ok usually)
    };

    const handleDragOver = (e, stage) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverStage !== stage) {
            setDragOverStage(stage);
        }
    };

    const handleDragLeave = (e) => {
        setDragOverStage(null);
    };

    const handleDrop = (e, stage) => {
        e.preventDefault();
        setDragOverStage(null);
        if (draggedProjectId) {
            // Optimistic update via store
            updateProjectStatus(draggedProjectId, stage);
        }
        setDraggedProjectId(null);
    };

    return (
        <motion.div
            className="production-container h-[calc(100vh-80px)]"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header shrink-0 mb-6 flex-wrap justify-between items-center">
                <div>
                    <h1 className="page-title">{t('production_board', 'Production Board')}</h1>
                    <p className="page-subtitle">{t('track_3d_workflow', 'Track and manage 3D workflow stages across active projects.')}</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder={t('search_projects', 'Search projects...')}
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="bg-transparent border-none text-[var(--text-primary)] outline-none w-full"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>{t('new_task_btn', 'New Task')}</span>
                    </button>
                </div>
            </header>

            <div className="kanban-board grow pb-4">
                {STAGES.map(stage => {
                    let stageProjects = projects.filter(p => (p.status || 'Queue') === stage);

                    if (searchFilter.trim() !== '') {
                        const lower = searchFilter.toLowerCase();
                        stageProjects = stageProjects.filter(p =>
                            (p.name || '').toLowerCase().includes(lower) ||
                            (p.client || '').toLowerCase().includes(lower) ||
                            (p.reference || '').toLowerCase().includes(lower)
                        );
                    }

                    const isOver = dragOverStage === stage;

                    return (
                        <div
                            key={stage}
                            className={`kanban-column ${isOver ? 'ring-2 ring-accent-cyan bg-accent-cyan/5' : ''}`}
                            onDragOver={(e) => handleDragOver(e, stage)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            <div className="kanban-column-header">
                                <h3 className="kanban-column-title">
                                    {t(`stage_${stage.toLowerCase().replace(' ', '_')}`, stage).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}
                                    <span className="kanban-column-count">{stageProjects.length}</span>
                                </h3>
                            </div>

                            <div className="kanban-column-body custom-scrollbar">
                                <AnimatePresence>
                                    {stageProjects.map(project => (
                                        <KanbanCard
                                            key={project.id}
                                            project={project}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </AnimatePresence>

                            </div>
                        </div>
                    );
                })}
            </div>

            <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </motion.div>
    );
};

const Production = () => (
    <ErrorBoundary>
        <ProductionUI />
    </ErrorBoundary>
);

export default Production;
