import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Circle, CheckCircle2, Clock, Calendar, Plus, User, MoreVertical, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { EditTaskModal } from '../components/Modals';
import { useLocation, useNavigate } from 'react-router-dom';
import './Tasks.css';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: "spring", stiffness: 300, damping: 30
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
};

const Tasks = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        tasks,
        currentUser,
        userRole,
        addTask,
        updateTaskStatus,
        deleteTask,
        projects,
        employees
    } = useStore();

    const [timeFilter, setTimeFilter] = useState('All'); // 'Today', 'Week', 'Month', 'All'
    const [employeeFilter, setEmployeeFilter] = useState('All');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskUrgent, setNewTaskUrgent] = useState(false);

    // Editing State Pipeline
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setEditTaskModalOpen(true);
    };

    // Auto-open task if navigating from dashboard with a taskId
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskId = params.get('taskId');
        if (taskId && tasks) {
            const targetTask = tasks.find(t => t.id === taskId);
            if (targetTask) {
                handleTaskClick(targetTask);
                // Clean up the URL so it doesn't re-open on refresh
                navigate('/tasks', { replace: true });
            }
        }
    }, [location.search, tasks, navigate]);

    // Provide auto-fill suggestions
    const projectSuggestions = useMemo(() => {
        if (!newTaskTitle.trim()) return [];

        const words = newTaskTitle.toLowerCase().split(/[\s,]+/).filter(w => w.length >= 2);
        if (words.length === 0) return [];

        return projects.filter(p => {
            const ref = p.reference.toLowerCase();
            const name = p.name.toLowerCase();
            const client = p.client.toLowerCase();

            // Show suggestion if ANY typed word matches the reference, name, or client
            return words.some(word =>
                ref.includes(word) ||
                name.includes(word) ||
                client.includes(word)
            );
        }).slice(0, 15);
    }, [newTaskTitle, projects]);

    const handleSelectProject = (project) => {
        const tag = `[${project.reference}]`;

        // Find which word triggered the match so we can remove it (e.g. they typed "rot" just to search)
        const words = newTaskTitle.split(/[\s,]+/);
        let matchWord = '';

        const ref = project.reference.toLowerCase();
        const name = project.name.toLowerCase();
        const client = project.client.toLowerCase();

        for (const w of words) {
            const lowerW = w.toLowerCase();
            if (lowerW.length >= 2 && (ref.includes(lowerW) || name.includes(lowerW) || client.includes(lowerW))) {
                matchWord = w; // Keep original case for replacement
                break;
            }
        }

        // Remove the matched word so it doesn't stick around in the title
        let newTitle = newTaskTitle;
        if (matchWord) {
            // Replace the exact word, guarding against partial inner-word matches
            const regex = new RegExp(`\\b${matchWord}\\b`, 'i');
            newTitle = newTitle.replace(regex, '').trim();
        }

        // Clean up any double spaces left behind and remove existing PT tag
        const cleanTitle = newTitle.replace(/\s{2,}/g, ' ').replace(/^\[.*?\]\s*/, '');

        setNewTaskTitle(cleanTitle ? `${tag} ${cleanTitle}` : `${tag} `);
        setShowProjectSuggestions(false);
    };

    // Determine current user's initials if employee
    const userInitials = userRole === 'employee' ? currentUser.name?.substring(0, 2).toUpperCase() : null;

    // Derived filtered tasks
    const filteredTasks = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setDate(endOfToday.getDate() + 1);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return tasks.filter(task => {
            // 1. Employee Filter
            if (userRole === 'admin') {
                if (employeeFilter !== 'All' && task.assignee !== employeeFilter) {
                    return false;
                }
            } else if (userRole === 'employee') {
                if (task.assignee !== userInitials && task.assignee !== currentUser.name) {
                    return false;
                }
            }

            // 2. Time Filter
            if (timeFilter === 'Completed') {
                return task.status === 'Completed';
            }

            const taskDate = new Date(task.dueDate);
            if (timeFilter === 'Today') {
                return taskDate >= now && taskDate < endOfToday;
            } else if (timeFilter === 'Week') {
                return taskDate >= startOfWeek && taskDate < endOfWeek;
            } else if (timeFilter === 'Month') {
                return taskDate >= startOfMonth && taskDate <= endOfMonth;
            }

            return true; // 'All'
        }).sort((a, b) => {
            // Sort active first, then by date priority
            if (a.status !== b.status) return a.status === 'Completed' ? 1 : -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }, [tasks, timeFilter, employeeFilter, userRole, currentUser.name, userInitials]);

    // Accurate Time Overview counts for the sidebar based on active filters
    const { pendingTodayCount, completedWeekCount } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setDate(endOfToday.getDate() + 1);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        let pending = 0;
        let completed = 0;

        tasks.forEach(task => {
            // Apply employee filtering so the sidebar reflects the active view
            if (userRole === 'admin') {
                if (employeeFilter !== 'All' && task.assignee !== employeeFilter) return;
            } else if (userRole === 'employee') {
                if (task.assignee !== userInitials && task.assignee !== currentUser.name) return;
            }

            const taskDate = new Date(task.dueDate);

            // Pending Today: Due date is exactly today and not completed
            if (task.status !== 'Completed' && taskDate >= now && taskDate < endOfToday) {
                pending++;
            }

            // Completed Week: Due date is within this week and is completed
            if (task.status === 'Completed' && taskDate >= startOfWeek && taskDate < endOfWeek) {
                completed++;
            }
        });

        return { pendingTodayCount: pending, completedWeekCount: completed };
    }, [tasks, employeeFilter, userRole, currentUser.name, userInitials]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        // Determine default assignee if none selected
        let defaultAssignee = userInitials || currentUser.name;
        if (userRole === 'admin' && employeeFilter !== 'All') {
            defaultAssignee = employeeFilter;
        }
        const finalAssignee = newTaskAssignee || defaultAssignee;

        // Base new task date on current filter
        const due = new Date();
        if (timeFilter === 'Week') due.setDate(due.getDate() + 3);
        if (timeFilter === 'Month') due.setDate(due.getDate() + 15);

        // Attempt to find if current title matches any project
        let finalProjectId = null;
        let finalTitle = newTaskTitle;
        const potentialProj = projects.find(p => finalTitle.includes(`[${p.reference}]`));
        if (potentialProj) {
            finalProjectId = potentialProj.id;
            finalTitle = finalTitle.replace(`[${potentialProj.reference}]`, '').trim();
        }

        addTask({
            title: finalTitle,
            assignee: finalAssignee,
            dueDate: due.toISOString(),
            priority: newTaskUrgent ? 'High' : 'Medium',
            projectId: finalProjectId
        });
        setNewTaskTitle('');
        setNewTaskUrgent(false);
        setNewTaskAssignee('');
    };

    const toggleStatus = (id, currentStatus) => {
        updateTaskStatus(id, currentStatus === 'Pending' ? 'Completed' : 'Pending');
    };

    // Helper to get employee name from initials
    const getEmployeeName = (initials) => {
        const employee = employees.find(emp => emp.initials === initials);
        return employee ? employee.name : initials;
    };

    return (
        <motion.div
            className="tasks-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header tasks-page-header">
                <div>
                    <h1 className="page-title tasks-title">
                        <CheckSquare className="tasks-title-icon" size={32} />
                        Daily Tasks
                    </h1>
                    <p className="page-subtitle">Track and manage your scheduled to-dos</p>
                </div>
            </header>

            <div className="tasks-layout">
                {/* Main Task List */}
                <div className="tasks-main-content">
                    <div className="glass-panel tasks-panel">

                        {/* Filters */}
                        <div className="tasks-filters-header">
                            <div className="tasks-time-filters">
                                {['Today', 'Week', 'Month', 'All', 'Completed'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`tasks-filter-btn ${timeFilter === tab ? 'active' : ''}`}
                                        onClick={() => setTimeFilter(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <span className="tasks-count">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found</span>
                        </div>

                        {/* Add Task Input */}
                        <form onSubmit={handleAddTask} className="add-task-form relative">
                            {userRole === 'admin' && (
                                <div className="admin-task-controls">
                                    <div className="admin-assign-wrapper">
                                        <User size={14} className="admin-assign-icon" />
                                        <select
                                            className="admin-assign-select"
                                            value={newTaskAssignee}
                                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                                        >
                                            <option value="" className="admin-assign-option">Assign to me</option>
                                            {employees.filter(emp => emp.role !== 'admin').map(emp => (
                                                <option key={emp.id} value={emp.initials} className="admin-assign-option">Assign to {emp.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setNewTaskUrgent(!newTaskUrgent)}
                                        className={`admin-alert-toggle ${newTaskUrgent ? 'active' : ''}`}
                                        title="Mark task as Urgent"
                                    >
                                        <div className={`alert-indicator ${newTaskUrgent ? 'active' : ''}`}></div>
                                        Alert
                                    </button>
                                </div>
                            )}

                            <div className="task-input-wrapper relative">
                                <div className="task-input-icon">
                                    <Plus size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Add a new task... (Type PT number to relate project)`}
                                    className="add-task-input"
                                    value={newTaskTitle}
                                    onChange={(e) => {
                                        setNewTaskTitle(e.target.value);
                                        setShowProjectSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowProjectSuggestions(false), 200)}
                                    onFocus={() => setShowProjectSuggestions(true)}
                                />
                                <button type="submit" disabled={!newTaskTitle.trim()} className="add-task-submit">
                                    Add
                                </button>
                            </div>

                            {/* Absolute Project Suggestions Dropdown */}
                            <AnimatePresence>
                                {showProjectSuggestions && projectSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden z-[100] flex flex-col max-h-[320px] overflow-y-auto custom-scrollbar"
                                    >
                                        {projectSuggestions.map(project => (
                                            <div
                                                key={project.id}
                                                className="p-3 hover:bg-[var(--hover-bg)] cursor-pointer flex items-center justify-between transition-colors border-b border-[var(--glass-border)]/30 last:border-0 group"
                                                onMouseDown={(e) => {
                                                    // Prevent blur from firing before click
                                                    e.preventDefault();
                                                    handleSelectProject(project);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan text-xs border border-accent-cyan/20 group-hover:border-accent-cyan/50">{project.reference}</span>
                                                    <span className="text-[var(--text-primary)] text-sm font-medium truncate max-w-[200px]">{project.name !== 'Unknown' ? project.name : 'Untitled Project'}</span>
                                                </div>
                                                <span className="text-xs text-secondary truncate max-w-[150px]">{project.client}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Task List */}
                        <div className="tasks-list-container">
                            <AnimatePresence>
                                {filteredTasks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="tasks-empty-state"
                                    >
                                        <div className="tasks-empty-icon">
                                            <CheckSquare size={24} />
                                        </div>
                                        <p className="tasks-empty-title">You're all caught up!</p>
                                        <p className="tasks-empty-subtitle">No tasks scheduled for this period.</p>
                                    </motion.div>
                                ) : (
                                    filteredTasks.map(task => {
                                        const isCompleted = task.status === 'Completed';
                                        return (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                                                transition={{ duration: 0.2 }}
                                                className={`task-card group ${isCompleted ? 'completed' : ''}`}
                                            >
                                                <div className="task-card-content">
                                                    <button
                                                        onClick={() => toggleStatus(task.id, task.status)}
                                                        className={`task-checkbox ${isCompleted ? 'checked pulse-success' : ''}`}
                                                    >
                                                        {isCompleted ? <CheckCircle2 size={24} /> : null}
                                                    </button>
                                                    <div className="task-details">
                                                        <span
                                                            className={`task-title-text ${isCompleted ? 'completed-text' : ''} cursor-pointer hover:text-[var(--accent-cyan)] transition-colors`}
                                                            onClick={() => handleTaskClick(task)}
                                                            title="Click to edit"
                                                        >
                                                            {task.title}
                                                        </span>
                                                        <div className="task-meta">
                                                            {task.projectId && (
                                                                <span
                                                                    className="text-[11px] font-mono bg-[#2A2D35] text-[var(--accent-cyan)] font-medium px-2 py-0.5 rounded border border-[#3A3D45] flex items-center justify-center -ml-1 h-fit leading-none mt-0.5 box-border hover:bg-[#343844] transition-colors cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/project/${task.projectId}`);
                                                                    }}
                                                                >
                                                                    {projects.find(p => p.id === task.projectId)?.reference}
                                                                </span>
                                                            )}
                                                            <span className="task-meta-item">
                                                                <Calendar size={12} />
                                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                            {userRole === 'admin' && (
                                                                <span className="task-meta-item">
                                                                    <User size={12} />
                                                                    {getEmployeeName(task.assignee)}
                                                                </span>
                                                            )}
                                                            {task.priority === 'High' && !isCompleted && (
                                                                <span className="task-urgent-badge">Urgent</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="task-delete-btn"
                                                    title="Delete task"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="tasks-sidebar">
                    {/* Admin Employee Filter */}
                    {userRole === 'admin' && (
                        <div className="tasks-employee-filter glass-panel">
                            <h3 className="filter-title">Filter</h3>
                            <div className="filter-options">
                                <button
                                    className={`filter-opt-btn ${employeeFilter === 'All' ? 'active' : ''}`}
                                    onClick={() => setEmployeeFilter('All')}
                                >
                                    All Tasks
                                </button>
                                <button
                                    className={`filter-opt-btn ${employeeFilter === currentUser.name ? 'active' : ''}`}
                                    onClick={() => setEmployeeFilter(currentUser.name)}
                                >
                                    My Tasks
                                </button>
                                {employees.filter(emp => emp.role !== 'admin').map(emp => (
                                    <button
                                        key={emp.id}
                                        className={`filter-opt-btn ${employeeFilter === emp.initials ? 'active' : ''}`}
                                        onClick={() => setEmployeeFilter(emp.initials)}
                                    >
                                        {emp.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="glass-panel tasks-sidebar-panel">
                        <h3 className="tasks-sidebar-title">
                            <Clock size={16} />
                            Time Overview
                        </h3>
                        <div className="tasks-overview-stats">
                            <div className="task-stat-card">
                                <span className="task-stat-label">Pending Today</span>
                                <span className="task-stat-value warning">
                                    {pendingTodayCount}
                                </span>
                            </div>
                            <div className="task-stat-card">
                                <span className="task-stat-label">Completed Week</span>
                                <span className="task-stat-value success">
                                    {completedWeekCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditTaskModal isOpen={editTaskModalOpen} onClose={() => setEditTaskModalOpen(false)} task={selectedTask} />
        </motion.div>
    );
};

export default Tasks;
