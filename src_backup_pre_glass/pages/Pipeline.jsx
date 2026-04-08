import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './Pipeline.css';
import { Plus, MoreHorizontal, Calendar, DollarSign, Users, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { AddLeadModal } from '../components/Modals';

const StatCard = ({ title, value, detail, icon: Icon, trend }) => (
    <div className="stat-card glass-panel">
        <div className="stat-header">
            <h3 className="stat-title">{title}</h3>
            <div className={`stat-icon ${trend}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="stat-value">{value}</div>
        {detail && <div className="stat-detail">{detail}</div>}
    </div>
);

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


const LeadCard = ({ lead, index }) => (
    <Draggable draggableId={lead.id} index={index}>
        {(provided, snapshot) => (
            <div
                className={`lead-card glass-panel ${snapshot.isDragging ? 'is-dragging' : ''}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                    ...provided.draggableProps.style,
                }}
            >
                <div className="lead-header">
                    <span className="lead-client">{lead.client}</span>
                    <button className="btn-icon"><MoreHorizontal size={16} /></button>
                </div>
                <div className="lead-project">{lead.project || lead.client}</div>

                <div className="lead-footer">
                    <div className="lead-meta">
                        <DollarSign size={14} />
                        <span>{lead.value}</span>
                    </div>
                    <div className="lead-meta">
                        <Calendar size={14} />
                        <span>{lead.expectedClose || lead.added}</span>
                    </div>
                </div>
            </div>
        )}
    </Draggable>
);

const PipelineColumn = ({ column, leads }) => (
    <div className="pipeline-col">
        <div className="col-header">
            <div className="col-title-wrap">
                <div className={`col-indicator ${column.colorClass}`}></div>
                <h3 className="col-title">{column.title}</h3>
                <span className="col-count">{leads.length}</span>
            </div>
            <button className="btn-icon"><Plus size={16} /></button>
        </div>

        <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
                <div
                    className={`col-content ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    {leads.map((lead, index) => <LeadCard key={lead.id} lead={lead} index={index} />)}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </div>
);

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Pipeline = () => {
    const pipelineData = useStore(state => state.pipelineData);
    const setPipelineData = useStore(state => state.setPipelineData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    const onDragEnd = result => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startCol = pipelineData.columns[source.droppableId];
        const finishCol = pipelineData.columns[destination.droppableId];

        if (startCol === finishCol) {
            const newTaskIds = Array.from(startCol.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startCol, taskIds: newTaskIds };
            setPipelineData({
                ...pipelineData,
                columns: { ...pipelineData.columns, [newColumn.id]: newColumn }
            });
            return;
        }

        const startTaskIds = Array.from(startCol.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartCol = { ...startCol, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finishCol.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinishCol = { ...finishCol, taskIds: finishTaskIds };

        setPipelineData({
            ...pipelineData,
            columns: {
                ...pipelineData.columns,
                [newStartCol.id]: newStartCol,
                [newFinishCol.id]: newFinishCol
            }
        });
    };

    return (
        <motion.div
            className="pipeline-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header">
                <div>
                    <h1 className="page-title">Sales Pipeline</h1>
                    <p className="page-subtitle">Track leads and opportunities.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="bg-transparent border-none text-[var(--text-primary)] outline-none w-full"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>Add Lead</span>
                    </button>
                </div >
            </header >

            <motion.section className="stats-grid" variants={containerVariants} initial="hidden" animate="show" style={{ marginBottom: '2rem' }}>
                <StatCard title="Total Leads" value={pipelineData ? Object.values(pipelineData.columns).reduce((acc, col) => acc + col.taskIds.length, 0) : 0} detail="All active stages" icon={Users} trend="primary" />
                <StatCard title="New Leads" value={pipelineData?.columns['column-1']?.taskIds?.length || 0} detail="Awaiting contact" icon={Clock} trend="warning" />
                <StatCard title="Proposals" value={pipelineData?.columns['column-3']?.taskIds?.length || 0} detail="Pending approval" icon={TrendingUp} trend="up" />
                <StatCard title="Won" value={pipelineData?.columns['column-4']?.taskIds?.length || 0} detail="Successfully closed" icon={CheckCircle} trend="success" />
            </motion.section >

            <div className="board-container">
                <DragDropContext onDragEnd={onDragEnd}>
                    {pipelineData?.columnOrder?.map(columnId => {
                        const column = pipelineData.columns[columnId];
                        let tempLeads = column.taskIds.map(taskId => pipelineData.tasks[taskId]);

                        // Apply filter
                        if (searchFilter.trim() !== '') {
                            const lowerFilter = searchFilter.toLowerCase();
                            tempLeads = tempLeads.filter(lead =>
                                (lead.client || '').toLowerCase().includes(lowerFilter) ||
                                (lead.project || '').toLowerCase().includes(lowerFilter)
                            );
                        }

                        return <PipelineColumn key={column.id} column={column} leads={tempLeads} />;
                    })}
                </DragDropContext>
            </div>

            <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </motion.div>
    );
};

export default Pipeline;
