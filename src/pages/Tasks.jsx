import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckSquare, Circle, CheckCircle2, Clock, Calendar, Plus, User, MoreVertical, Trash2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import { EditTaskModal } from '../components/Modals';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const toGreekCaps = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
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
    const { t } = useTranslation();
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
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskUrgent, setNewTaskUrgent] = useState(false);
    const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());

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

    // Calendar logic helpers
    const updateTask = useStore(state => state.updateTask);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        const task = tasks.find(t => t.id === draggableId);
        if (!task) return;

        let destYear, destMonth, destDay;
        if (destination.droppableId === 'day-view') {
            destYear = calendarCurrentDate.getFullYear();
            destMonth = calendarCurrentDate.getMonth();
            destDay = calendarCurrentDate.getDate();
        } else {
            // Calendar grid droppableId format: "YYYY-MM-DD"
            const [yearStr, monthStr, dayStr] = destination.droppableId.split('-');
            destYear = parseInt(yearStr, 10);
            destMonth = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS
            destDay = parseInt(dayStr, 10);
        }

        const oldDate = new Date(task.dueDate);
        const destDate = new Date(destYear, destMonth, destDay, oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());

        // Same list reordering (either 'day-view' to 'day-view' OR 'YYYY-MM-DD' to 'YYYY-MM-DD')
        if (destination.droppableId === source.droppableId) {
            if (destination.index === source.index) return; // No movement

            // Find all tasks rendered in this cell/day
            const sameCellTasks = tasks.filter(t => {
                if (userRole === 'admin' && employeeFilter !== 'All' && t.assignee !== employeeFilter) return false;
                if (userRole === 'employee' && t.assignee !== userInitials && t.assignee !== currentUser.name) return false;
                const d = new Date(t.dueDate);
                return d.getDate() === destDay && d.getMonth() === destMonth && d.getFullYear() === destYear;
            }).sort((a, b) => {
                if (a.status !== b.status) return a.status === 'Completed' ? 1 : -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            // Reorder the array
            const newOrder = Array.from(sameCellTasks);
            const [movedTask] = newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, movedTask);

            let newDate;
            if (newOrder.length === 1) return;

            if (destination.index === 0) {
                const nextTask = newOrder[1];
                const nextTime = new Date(nextTask.dueDate).getTime();
                const dayStart = new Date(destYear, destMonth, destDay, 0, 0, 0).getTime();
                newDate = new Date(Math.max(nextTime - 1000, dayStart));
            } else if (destination.index === newOrder.length - 1) {
                const prevTask = newOrder[newOrder.length - 2];
                const prevTime = new Date(prevTask.dueDate).getTime();
                const dayEnd = new Date(destYear, destMonth, destDay, 23, 59, 59, 999).getTime();
                newDate = new Date(Math.min(prevTime + 1000, dayEnd));
            } else {
                const prevTask = newOrder[destination.index - 1];
                const nextTask = newOrder[destination.index + 1];
                const t1 = new Date(prevTask.dueDate).getTime();
                const t2 = new Date(nextTask.dueDate).getTime();
                newDate = new Date((t1 + t2) / 2);
            }

            updateTask(draggableId, { dueDate: newDate.toISOString() });
            return;
        }

        // Cross-day move
        // Generate a time for the newly dropped task so it sits at the bottom of the destination day by default
        const destTasks = tasks.filter(t => {
            const d = new Date(t.dueDate);
            return d.getDate() === destDay && d.getMonth() === destMonth && d.getFullYear() === destYear;
        });

        if (destTasks.length > 0) {
            const destEnd = new Date(destYear, destMonth, destDay, 23, 59, 59, 999).getTime();
            const lastTaskTime = Math.max(...destTasks.map(t => new Date(t.dueDate).getTime()));
            destDate.setTime(Math.min(lastTaskTime + 1000, destEnd));
            updateTask(draggableId, { dueDate: destDate.toISOString() });
        } else {
            destDate.setHours(9, 0, 0); // Default to 9 AM if empty
            updateTask(draggableId, { dueDate: destDate.toISOString() });
        }
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const previousMonth = () => {
        setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 1));
    };

    const previousDay = () => {
        setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), calendarCurrentDate.getDate() - 1));
    };

    const nextDay = () => {
        setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), calendarCurrentDate.getDate() + 1));
    };

    const renderDayView = () => {
        const year = calendarCurrentDate.getFullYear();
        const month = calendarCurrentDate.getMonth();
        const date = calendarCurrentDate.getDate();

        // Month names array is defined locally usually, let's redefine or use toLocaleDateString
        const dateString = calendarCurrentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const dayTasks = tasks.filter(task => {
            if (userRole === 'admin') {
                if (employeeFilter !== 'All' && task.assignee !== employeeFilter) return false;
            } else if (userRole === 'employee') {
                if (task.assignee !== userInitials && task.assignee !== currentUser.name) return false;
            }
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === date && taskDate.getMonth() === month && taskDate.getFullYear() === year;
        }).sort((a, b) => {
            if (a.status !== b.status) return a.status === 'Completed' ? 1 : -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="calendar-wrapper">
                    <div className="calendar-header">
                        <button onClick={previousDay} className="calendar-nav-btn"><ChevronLeft size={20} /></button>
                        <h2 className="calendar-month-title">{dateString}</h2>
                        <button onClick={nextDay} className="calendar-nav-btn"><ChevronRight size={20} /></button>
                    </div>

                    <div className="mt-4 pb-12 w-full">
                        <Droppable droppableId="day-view">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`min-h-[200px] w-full transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                                >
                                    <AnimatePresence>
                                        {dayTasks.length === 0 ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tasks-empty-state">
                                                <div className="tasks-empty-icon"><CheckSquare size={24} /></div>
                                                <p className="tasks-empty-title">{t('clear_schedule', 'Clear schedule!')}</p>
                                                <p className="tasks-empty-subtitle">{t('no_tasks_assigned_day', 'No tasks assigned for this day.')}</p>
                                            </motion.div>
                                        ) : (
                                            dayTasks.map((task, index) => {
                                                const isCompleted = task.status === 'Completed';
                                                return (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => {
                                                            const child = (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        marginBottom: '0.75rem',
                                                                    }}
                                                                >
                                                                    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={`task-card group ${isCompleted ? 'completed' : ''} ${snapshot.isDragging ? 'shadow-2xl border-accent-cyan/50 ring-1 ring-accent-cyan/50 bg-[#1e212b]' : ''} m-0`}>
                                                                        <div className="task-card-content flex items-center pr-2">
                                                                            <div {...provided.dragHandleProps} className="p-2 -ml-2 mr-1 text-secondary/30 hover:text-white cursor-grab active:cursor-grabbing transition-colors" title="Drag to reorder priority">
                                                                                <GripVertical size={18} />
                                                                            </div>
                                                                            <button onClick={() => toggleStatus(task.id, task.status)} className={`task-checkbox ${isCompleted ? 'checked pulse-success' : ''}`}>
                                                                                {isCompleted ? <CheckCircle2 size={24} /> : null}
                                                                            </button>
                                                                            <div className="task-details ml-2">
                                                                                <span className={`task-title-text ${isCompleted ? 'completed-text' : ''} cursor-pointer hover:text-[var(--accent-cyan)] transition-colors`} onClick={() => handleTaskClick(task)}>{task.title}</span>
                                                                                <div className="task-meta mt-1">
                                                                                    {task.projectId && (
                                                                                        <span className="text-[11px] font-mono bg-[#2A2D35] text-[var(--accent-cyan)] font-medium px-2 py-0.5 rounded border border-[#3A3D45] cursor-pointer hover:bg-[#323642] transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/project/${task.projectId}`); }}>
                                                                                            {projects.find(p => p.id === task.projectId)?.reference}
                                                                                        </span>
                                                                                    )}
                                                                                    {userRole === 'admin' && <span className="task-meta-item"><User size={12} />{getEmployeeName(task.assignee)}</span>}
                                                                                    {task.priority === 'High' && !isCompleted && <span className="task-urgent-badge">{toGreekCaps(t('urgent', 'Urgent'))}</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            );
                                                            if (snapshot.isDragging) {
                                                                return createPortal(child, document.body);
                                                            }
                                                            return child;
                                                        }}
                                                    </Draggable>
                                                );
                                            })
                                        )}
                                    </AnimatePresence>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
        );
    };

    const renderCalendarGrid = () => {
        const year = calendarCurrentDate.getFullYear();
        const month = calendarCurrentDate.getMonth();
        const numDays = daysInMonth(year, month);
        const startingDay = firstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday
        const adjustedStartDay = startingDay === 0 ? 6 : startingDay - 1; // Make Monday = 0

        const days = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Filter tasks for the calendar view (respect employee filter, ignore time filter as calendar shows whole month)
        const calendarTasks = tasks.filter(task => {
            if (userRole === 'admin') {
                if (employeeFilter !== 'All' && task.assignee !== employeeFilter) return false;
            } else if (userRole === 'employee') {
                if (task.assignee !== userInitials && task.assignee !== currentUser.name) return false;
            }
            return true;
        });

        // Blank cells before the 1st
        for (let i = 0; i < adjustedStartDay; i++) {
            days.push(<div key={`blank-${i}`} className="calendar-day empty"></div>);
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        for (let i = 1; i <= numDays; i++) {
            const isToday = isCurrentMonth && today.getDate() === i;

            // Find tasks for this specific day
            const dayTasks = calendarTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getDate() === i && taskDate.getMonth() === month && taskDate.getFullYear() === year;
            }).sort((a, b) => {
                if (a.status !== b.status) return a.status === 'Completed' ? 1 : -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            const dropId = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            days.push(
                <Droppable key={dropId} droppableId={dropId}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`calendar-day ${isToday ? 'today' : ''} ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                        >
                            <div className="day-number">{i}</div>
                            <div className="day-tasks">
                                {dayTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => {
                                            const child = (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`calendar-task-pill ${task.status === 'Completed' ? 'completed' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    onClick={() => handleTaskClick(task)}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        marginBottom: '0.25rem'
                                                    }}
                                                >
                                                    <span className="truncate">{task.title}</span>
                                                </div>
                                            );
                                            if (snapshot.isDragging) {
                                                return createPortal(child, document.body);
                                            }
                                            return child;
                                        }}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        </div>
                    )}
                </Droppable>
            );
        }

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="calendar-wrapper">
                    <div className="calendar-header">
                        <button onClick={previousMonth} className="calendar-nav-btn"><ChevronLeft size={20} /></button>
                        <h2 className="calendar-month-title">{monthNames[month]} {year}</h2>
                        <button onClick={nextMonth} className="calendar-nav-btn"><ChevronRight size={20} /></button>
                    </div>
                    <div className="calendar-grid">
                        <div className="calendar-weekday">{toGreekCaps(t('mon_short', 'Mon'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('tue_short', 'Tue'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('wed_short', 'Wed'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('thu_short', 'Thu'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('fri_short', 'Fri'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('sat_short', 'Sat'))}</div>
                        <div className="calendar-weekday">{toGreekCaps(t('sun_short', 'Sun'))}</div>
                        {days}
                    </div>
                </div>
            </DragDropContext>
        );
    };

    return (
        <div className="tasks-container">
            <header className="page-header tasks-page-header">
                <div>
                    <h1 className="page-title tasks-title">
                        <CheckSquare className="tasks-title-icon" size={32} />
                        {toGreekCaps(t('daily_tasks', 'Daily Tasks'))}
                    </h1>
                    <p className="page-subtitle">{t('track_manage_todos', 'Track and manage your scheduled to-dos')}</p>
                </div>
            </header>

            <div className="tasks-layout">
                {/* Main Task List */}
                <div className="tasks-main-content">
                    <div className="glass-panel tasks-panel">

                        {/* Filters */}
                        <div className="tasks-filters-header">
                            <div className="flex items-center gap-4">
                                {viewMode === 'list' && (
                                    <div className="tasks-time-filters mr-2">
                                        {['Today', 'Week', 'Month', 'All', 'Completed'].map(tab => (
                                            <button
                                                key={tab}
                                                className={`tasks-filter-btn ${timeFilter === tab ? 'active' : ''}`}
                                                onClick={() => setTimeFilter(tab)}
                                            >
                                                {t(`time_filter_${tab.toLowerCase()}`, tab)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="tasks-time-filters">
                                    <button
                                        className={`tasks-filter-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        {t('view_list', 'List')}
                                    </button>
                                    <button
                                        className={`tasks-filter-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        {t('view_month', 'Month')}
                                    </button>
                                    <button
                                        className={`tasks-filter-btn ${viewMode === 'day' ? 'active' : ''}`}
                                        onClick={() => setViewMode('day')}
                                    >
                                        {t('view_day', 'Day')}
                                    </button>
                                </div>
                            </div>
                            <span className="tasks-count">{filteredTasks.length} {filteredTasks.length === 1 ? t('task', 'task') : t('tasks', 'tasks')} {t('found', 'found')}</span>
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
                                            <option value="" className="admin-assign-option">{t('assign_to_me', 'Assign to me')}</option>
                                            {employees.filter(emp => emp.role !== 'admin').map(emp => (
                                                <option key={emp.id} value={emp.initials} className="admin-assign-option">{t('assign_to', 'Assign to')} {emp.name}</option>
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
                                        {t('alert', 'Alert')}
                                    </button>
                                </div>
                            )}

                            <div className="task-input-wrapper relative">
                                <div className="task-input-icon">
                                    <Plus size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('add_new_task_placeholder', 'Add a new task... (Type PT number to relate project)')}
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
                                    {t('add', 'Add')}
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

                        {viewMode === 'calendar' ? (
                            renderCalendarGrid()
                        ) : viewMode === 'day' ? (
                            renderDayView()
                        ) : (
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
                                            <p className="tasks-empty-title">{t('all_caught_up', "You're all caught up!")}</p>
                                            <p className="tasks-empty-subtitle">{t('no_tasks_scheduled', 'No tasks scheduled for this period.')}</p>
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
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="tasks-sidebar">
                    {/* Admin Employee Filter */}
                    {userRole === 'admin' && (
                        <div className="tasks-employee-filter glass-panel">
                            <h3 className="filter-title">{toGreekCaps(t('filter', 'Filter'))}</h3>
                            <div className="filter-options">
                                <button
                                    className={`filter-opt-btn ${employeeFilter === 'All' ? 'active' : ''}`}
                                    onClick={() => setEmployeeFilter('All')}
                                >
                                    {t('all_tasks', 'All Tasks')}
                                </button>
                                <button
                                    className={`filter-opt-btn ${employeeFilter === currentUser.name ? 'active' : ''}`}
                                    onClick={() => setEmployeeFilter(currentUser.name)}
                                >
                                    {t('my_tasks', 'My Tasks')}
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
                            {t('time_overview', 'Time Overview')}
                        </h3>
                        <div className="tasks-overview-stats">
                            <div className="task-stat-card">
                                <span className="task-stat-label">{t('pending_today', 'Pending Today')}</span>
                                <span className="task-stat-value warning">
                                    {pendingTodayCount}
                                </span>
                            </div>
                            <div className="task-stat-card">
                                <span className="task-stat-label">{t('completed_week', 'Completed Week')}</span>
                                <span className="task-stat-value success">
                                    {completedWeekCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditTaskModal isOpen={editTaskModalOpen} onClose={() => setEditTaskModalOpen(false)} task={selectedTask} />
        </div>
    );
};

export default Tasks;
