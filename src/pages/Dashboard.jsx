import React, { useState } from 'react';
import './Dashboard.css';
import { TrendingUp, Users, Clock, CheckCircle, Euro, Wallet, MessageSquare, GripHorizontal, Settings2, Check, CheckSquare, Edit2 } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const toGreekCaps = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
};

const StatCard = ({ title, value, detail, icon: Icon, trend }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="stat-card glass-panel"
    >
        <div className="stat-header">
            <h3 className="stat-title">{title}</h3>
            <div className={`stat-icon-wrapper ${trend}`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-detail">{detail}</div>
    </motion.div>
);

const projectImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400'
];

import { AddProjectModal, EditTaskModal } from '../components/Modals';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projects: allProjects, metrics, currentUser, userRole, updateProjectStatus, dashboardLayout, updateDashboardLayout, tasks, assets, dashboardModules, updateDashboardModules, employees } = useStore();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setEditTaskModalOpen(true);
    };

    // Admin Chart Filter
    const [chartTimeFilter, setChartTimeFilter] = useState('All');

    // Sort & Filter state for the list
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [statusFilter, setStatusFilter] = useState('All');

    // Helper to format employee names
    const getEmployeeName = (initialsOrName) => {
        if (!initialsOrName) return 'System';
        if (initialsOrName.includes(',')) {
            // Handle multiple assignees
            return initialsOrName.split(',').map(initial => {
                const emp = employees.find(e => e.initials === initial.trim());
                return emp ? emp.name : initial.trim();
            }).join(', ');
        }
        const emp = employees.find(e => e.initials === initialsOrName);
        return emp ? emp.name : initialsOrName;
    };

    const getProjectRef = (projectId) => {
        if (!projectId) return null;
        const proj = allProjects.find(p => p.id === projectId);
        return proj ? proj.reference : null;
    };

    // Filter projects based on role
    let displayProjects = [...allProjects]; // PREVENT MUTATING GLOBAL ARRAY
    if (userRole === 'client') {
        displayProjects = allProjects.filter(p => p.client === currentUser.name);
    } else if (userRole === 'employee') {
        const userCode = currentUser.name?.substring(0, 2).toUpperCase() || '';
        displayProjects = allProjects.filter(p => p.assignee.includes(userCode));
    }

    if (statusFilter !== 'All') {
        displayProjects = displayProjects.filter(p => p.status === statusFilter);
    }

    // Sort logic
    displayProjects.sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortConfig.key === 'progress') {
            return sortConfig.direction === 'asc' ? a.progress - b.progress : b.progress - a.progress;
        } else if (sortConfig.key === 'client') {
            return sortConfig.direction === 'asc' ? a.client.localeCompare(b.client) : b.client.localeCompare(a.client);
        }
        // default date/id fallbacks
        return sortConfig.direction === 'asc' ? 1 : -1;
    });

    const recentProjects = [...displayProjects].slice(0, 10); // Take top 10 after filter/sort

    // Calculate chart data for admin with time filters
    const statusCounts = {
        Queue: 0,
        Modeling: 0,
        Drafting: 0,
        'Client Review': 0,
        Revising: 0,
        Completed: 0
    };

    // Time filter logic for chart
    const getFilteredChartProjects = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return allProjects.filter(p => {
            if (chartTimeFilter === 'All') return true;

            // Assuming we use creation date or default to a recent date if none exists
            // In a real app we'd use p.createdAt, falling back to id/dueDate logic for demo purposes
            const projDate = p.createdAt ? new Date(p.createdAt) : new Date(p.dueDate || now);

            if (chartTimeFilter === 'Week') {
                return projDate >= startOfWeek;
            } else if (chartTimeFilter === 'Month') {
                return projDate >= startOfMonth;
            }
            return true;
        });
    };

    const chartFilteredProjects = getFilteredChartProjects();

    chartFilteredProjects.forEach(p => {
        if (statusCounts[p.status] !== undefined) {
            statusCounts[p.status]++;
        }
    });

    const chartData = Object.keys(statusCounts).map(key => ({
        name: t(`stage_${key.toLowerCase().replace(' ', '_')}`, key),
        originalKey: key,
        count: statusCounts[key]
    }));

    // Calculate Insights based on current filter
    const totalInPeriod = chartFilteredProjects.length;
    const completedInPeriod = chartFilteredProjects.filter(p => p.status === 'Completed').length;

    // Find most active phase (excluding completed to focus on work in progress)
    let mostActivePhase = 'None';
    let maxCount = 0;
    chartData.forEach(d => {
        if (d.originalKey !== 'Completed' && d.count > maxCount) {
            maxCount = d.count;
            mostActivePhase = d.originalKey;
        }
    });

    // Dynamic stat calculation
    const activeProjects = displayProjects.filter(p => p.status !== 'Completed');
    const completedProjects = displayProjects.filter(p => p.status === 'Completed');

    // For admin financials mock up
    const totalRevenue = displayProjects.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    const outstandingBalance = displayProjects.reduce((acc, p) => acc + (p.balance || 0), 0);

    const renderDailyTasksWidget = () => {
        if (userRole === 'client') return null;

        const todayTasks = tasks.filter(t => {
            // Employee sees only theirs, Admin sees all
            if (userRole === 'employee' && t.assignee !== currentUser.name && t.assignee !== (currentUser.name?.substring(0, 2).toUpperCase())) return false;

            if (!t.dueDate) return false;
            
            // Extract just the YYYY-MM-DD to avoid timezone shifting
            const taskDateStr = t.dueDate.substring(0, 10);
            
            const now = new Date();
            const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            
            return taskDateStr === todayStr;
        }).slice(0, 5); // Take top 5

        return (
            <motion.section
                className="daily-tasks-widget glass-panel w-full"
                variants={itemVariants}
                initial="hidden"
                animate="show"
            >
                <div className="section-header">
                    <h2 className="section-title widget-title flex items-center gap-2">
                        <CheckSquare size={18} className="text-[var(--accent-cyan)]" />
                        {t('todays_tasks', "Today's Tasks")}
                    </h2>
                    <Link to="/tasks" className="btn btn-ghost btn-sm no-underline text-inherit hover:text-[var(--accent-cyan)]">{t('view_all', 'View All')}</Link>
                </div>
                <div className="widget-content">
                    {todayTasks.length === 0 ? (
                        <div className="widget-empty-state">
                            <CheckSquare size={32} className="mb-2" />
                            <p className="text-sm">{t('no_tasks_today', 'No tasks due today.')}</p>
                        </div>
                    ) : (
                        todayTasks.map(task => (
                            <div key={task.id}
                                className="widget-task-card group relative"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(task.projectId ? `/project/${task.projectId}` : '/tasks')}
                            >
                                <div className="widget-task-info pr-16 pb-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`widget-task-title ${task.status === 'Completed' ? 'completed' : ''}`}>{task.title}</span>
                                        {task.projectId && getProjectRef(task.projectId) && (
                                            <span className="text-[11px] font-mono bg-[#2A2D35] text-[var(--accent-cyan)] font-medium px-2 py-0.5 rounded border border-[#3A3D45]">
                                                {getProjectRef(task.projectId)}
                                            </span>
                                        )}
                                    </div>
                                    {userRole === 'admin' && (
                                        <span className="widget-task-assignee"><Users size={12} /> {getEmployeeName(task.assignee)}</span>
                                    )}
                                </div>
                                <div className="widget-task-actions flex items-center justify-end gap-2 absolute right-3 top-1/2 -translate-y-1/2">
                                    <button
                                        className="btn-icon p-1.5 opacity-0 group-hover:opacity-100 hover:text-[var(--accent-cyan)] transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskClick(task);
                                        }}
                                        title="Edit Task"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {task.priority === 'High' && task.status !== 'Completed' && (
                                        <span className="widget-task-urgent">{t('urgent', 'Urgent')}</span>
                                    )}
                                    {task.status === 'Completed' && (
                                        <CheckCircle size={16} className="text-[var(--status-success)]" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.section>
        );
    };

    const renderAdminStats = () => {
        const statsData = {
            'active-projects': { id: 'active-projects', title: t('active_projects', "Active Projects"), value: activeProjects.length, detail: t('in_pipeline', "In Pipeline"), icon: TrendingUp, trend: "up" },
            'completion-ratio': { id: 'completion-ratio', title: t('completion_ratio', "Completion Ratio"), value: `${Math.round((completedProjects.length / Math.max(displayProjects.length, 1)) * 100)}%`, detail: `${completedProjects.length} ${t('of', 'of')} ${displayProjects.length} ${t('total', 'total')}`, icon: CheckCircle, trend: "success" },
            'total-revenue': { id: 'total-revenue', title: t('total_revenue', "Total Revenue"), value: <span style={{ color: 'var(--status-success)' }}>€{totalRevenue.toLocaleString()}</span>, detail: t('ytd_collected', "YTD Collected"), icon: Euro, trend: "success" },
            'outstanding': { id: 'outstanding', title: t('outstanding', "Outstanding"), value: <span style={{ color: 'var(--status-danger)' }}>€{outstandingBalance.toLocaleString()}</span>, detail: t('needs_collection', "Needs collection"), icon: Wallet, trend: "warning" }
        };

        return (
            <Reorder.Group
                axis="x"
                values={dashboardLayout}
                onReorder={updateDashboardLayout}
                className="stats-grid"
                style={{ listStyle: 'none', padding: 0 }}
            >
                {dashboardLayout.map(id => {
                    const stat = statsData[id];
                    if (!stat) return null;
                    return (
                        <Reorder.Item key={stat.id} value={stat.id} drag={isEditMode ? "x" : false} className="relative select-none">
                            {isEditMode && (
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full flex items-center justify-center cursor-grab text-[var(--text-primary)] z-20 shadow-lg hover:bg-accent-cyan transition-colors" title="Drag to reorder">
                                    <GripHorizontal size={14} />
                                </div>
                            )}
                            <StatCard {...stat} />
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>
        );
    };

    const renderEmployeeStats = () => (
        <motion.section className="stats-grid" variants={containerVariants} initial="hidden" animate="show">
            <StatCard title={t('my_active_tasks', "My Active Tasks")} value={activeProjects.length} detail={t('assigned_to_me', "Assigned to me")} icon={Clock} trend="warning" />
            <StatCard title={t('my_completed', "My Completed")} value={completedProjects.length} detail={t('great_job', "Great job!")} icon={CheckCircle} trend="success" />
        </motion.section>
    );

    const renderClientStats = () => (
        <motion.section className="stats-grid" variants={containerVariants} initial="hidden" animate="show">
            <StatCard title={t('open_projects', "Open Projects")} value={activeProjects.length} detail={t('currently_in_progress', "Currently in progress")} icon={Clock} trend="warning" />
            <StatCard title={t('completed_projects', "Completed Projects")} value={completedProjects.length} detail={t('delivered', "Delivered")} icon={CheckCircle} trend="success" />
            <StatCard title={t('pending_review', "Pending Review")} value={displayProjects.filter(p => p.status === 'Client Review').length} detail={t('requires_feedback', "Requires your feedback")} icon={Users} trend="warning" />
        </motion.section>
    );

    // Module renderers
    const renderStatsModule = () => {
        if (userRole === 'admin') return renderAdminStats();
        if (userRole === 'employee') return renderEmployeeStats();
        if (userRole === 'client') return renderClientStats();
        return null;
    };

    const renderAnalyticsModule = () => {
        if (userRole === 'client') return null;
        return (
            <motion.section
                className="analytics-section glass-panel w-full"
                variants={itemVariants}
                initial="hidden"
                animate="show"
            >
                <div className="analytics-chart-container">
                    <div className="analytics-header">
                        <div>
                            <h2 className="section-title m-0">{t('project_distribution', 'Project Distribution')}</h2>
                            <p className="analytics-subtitle">{t('volume_by_phase', 'Volume by production phase')}</p>
                        </div>
                        <div className="analytics-tabs-container">
                            {['All', 'Month', 'Week'].map(tab => (
                                <button
                                    key={tab}
                                    className={`analytics-tab ${chartTimeFilter === tab ? 'active' : ''}`}
                                    onClick={() => setChartTimeFilter(tab)}
                                >
                                    {toGreekCaps(t(`time_filter_${tab.toLowerCase()}`, tab))}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="analytics-chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 13 }} axisLine={false} tickLine={false} tickMargin={12} />
                                <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 13 }} allowDecimals={false} axisLine={false} tickLine={false} tickMargin={12} width={40} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--accent-purple)', fontWeight: 600 }}
                                    cursor={{ fill: 'var(--hover-bg)' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                    {chartData.map((entry, index) => {
                                        const colors = {
                                            'Queue': '#64748b',
                                            'Modeling': '#3b82f6',
                                            'Drafting': '#8b5cf6',
                                            'Client Review': '#f59e0b',
                                            'Completed': '#10b981'
                                        };
                                        return <Cell key={`cell-${index}`} fill={colors[entry.originalKey] || '#818cf8'} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-insights-sidebar">
                    <div className="analytics-sidebar-header">
                        <h2 className="section-title m-0">{t('period_insights', 'Period Insights')}</h2>
                        <p className="analytics-subtitle">{t('data_for', 'Data for:')} <span className="highlight-cyan">{chartTimeFilter === 'All' ? t('all_time', 'All Time') : `${t('this', 'This')} ${t(`time_filter_${chartTimeFilter.toLowerCase()}`, chartTimeFilter)}`}</span></p>
                    </div>
                    <div className="analytics-insights-content">
                        <div className="insight-card">
                            <div className="insight-label">{t('todays_tasks', "Today's Tasks")}</div>
                            <div className="insight-value">{totalInPeriod}</div>
                        </div>
                        <div className="insight-card">
                            <div className="insight-label">{t('completed', 'Completed')}</div>
                            <div className="insight-value-group">
                                <div className="insight-value success">{completedInPeriod}</div>
                                <div className="insight-badge success">
                                    {totalInPeriod > 0 ? Math.round((completedInPeriod / totalInPeriod) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                        <div className="insight-card">
                            <div className="insight-label">{t('bottleneck', 'Bottleneck / Most Active')}</div>
                            <div className="insight-value highlight-purple">{t(`stage_${mostActivePhase.toLowerCase().replace(' ', '_')}`, mostActivePhase)}</div>
                            <div className="insight-subtext">
                                {maxCount} <span>{t('projects', 'projects')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        );
    };

    const formatDeadline = (dateStr) => {
        if (!dateStr) return 'TBD';
        const due = new Date(dateStr);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Past Due';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} Days`;
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderRecentProjectsModule = () => (
        <section className="recent-projects glass-panel w-full h-full">
            <div className="section-header">
                <h2 className="section-title">
                    {userRole === 'client' ? t('your_projects', 'Your Projects') : t('active_production', 'Active Production (Latest 10)')}
                </h2>
                <div className="flex gap-3 text-sm">
                    <select
                        className="dashboard-select"
                        value={statusFilter}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">{t('all_statuses', 'All Statuses')}</option>
                        <option value="Queue">{t('stage_queue', 'Queue')}</option>
                        <option value="Modeling">{t('stage_modeling', 'Modeling')}</option>
                        <option value="Drafting">{t('stage_drafting', 'Drafting')}</option>
                        <option value="Client Review">{t('stage_client_review', 'Review')}</option>
                        <option value="Completed">{t('stage_completed', 'Completed')}</option>
                    </select>

                    <select
                        className="dashboard-select"
                        value={sortConfig.key}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onChange={(e) => handleSort(e.target.value)}
                    >
                        <option value="date">{t('sort_newest', 'Sort: Newest')}</option>
                        <option value="name">{t('sort_name', 'Sort: Name')}</option>
                        <option value="client">{t('sort_client', 'Sort: Client')}</option>
                        <option value="progress">{t('sort_progress', 'Sort: Progress')}</option>
                    </select>

                    {userRole !== 'client' && (
                        <Link to="/production" className="btn btn-ghost btn-sm no-underline text-inherit hover:text-[var(--text-primary)]">{t('view_all', 'View All')}</Link>
                    )}
                </div>
            </div>

            <motion.div className="project-list" variants={containerVariants} initial="hidden" animate="show">
                {recentProjects.length === 0 ? (
                    <div className="empty-state text-secondary p-4">{t('no_projects_to_display', 'No projects to display.')}</div>
                ) : (
                    recentProjects.map(project => (
                        <Link to={`/project/${project.id}`} key={project.id} className="block no-underline text-inherit">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ x: 4, backgroundColor: "var(--hover-bg)" }}
                                className="project-item items-center"
                            >
                                {/* Distinct PT Number Column */}
                                <div className="w-20 text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}>
                                    {project.reference || 'PT----'}
                                </div>

                                {(() => {
                                    const thumbSrc = assets.find(a => a.projectId === project.id && (a.type === 'Render' || a.type === 'Image') && a.url)?.url || projectImages[parseInt(project.id.replace(/\D/g, '') || 0) % projectImages.length];
                                    return (
                                        <div className="relative group h-10 w-16 shrink-0 rounded-md overflow-hidden border border-[var(--glass-border)] ml-2 mr-4 bg-[var(--bg-tertiary)]">
                                            <img 
                                                src={thumbSrc} 
                                                alt={project.name}
                                                className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                            />
                                            {/* Hover Large Image Tooltip */}
                                            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 z-50 hidden group-hover:block pointer-events-none fade-in">
                                                <div className="w-64 h-48 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                                    <img 
                                                        src={thumbSrc} 
                                                        alt={project.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="project-info flex-1">
                                    <span className="project-name">
                                        {project.name}
                                    </span>
                                    {userRole !== 'client' && <span className="project-client">{project.client}</span>}
                                </div>

                                <div className="project-status min-w-[140px] flex justify-end mr-4">
                                    {userRole === 'admin' ? (
                                        <select
                                            className="dashboard-select text-xs status-badge cursor-pointer"
                                            value={project.status}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onChange={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateProjectStatus(project.id, e.target.value);
                                            }}
                                        >
                                            <option value="Queue">{t('stage_queue', 'Queue')}</option>
                                            <option value="Modeling">{t('stage_modeling', 'Modeling')}</option>
                                            <option value="Drafting">{t('stage_drafting', 'Drafting')}</option>
                                            <option value="Client Review">{t('stage_client_review', 'Review')}</option>
                                            <option value="Completed">{t('stage_completed', 'Completed')}</option>
                                        </select>
                                    ) : (
                                        <div className="status-badge">{project.status}</div>
                                    )}
                                </div>

                                <div className="project-meta-col flex items-center justify-end text-sm text-secondary gap-6 w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="opacity-70" />
                                        <span>{getEmployeeName(project.assignee)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="opacity-70" />
                                        <span>{formatDeadline(project.dueDate)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                )}
            </motion.div>
        </section>
    );

    const renderActivityFeedModule = () => (
        <section className="activity-feed glass-panel w-full h-full">
            <div className="section-header">
                <h2 className="section-title">{t('recent_activity', 'Recent Activity')}</h2>
            </div>
            <div className="activity-list" style={{ maxHeight: '650px', overflowY: 'auto', padding: '1rem' }}>
                {(() => {
                    // Pull from multiple sources to create a rich activity feed
                    const timelineEvents = [];

                    // 1. Projects Feedback
                    allProjects.forEach(p => {
                        if (p.feedbackHistory && p.feedbackHistory.length > 0) {
                            p.feedbackHistory.forEach((f, idx) => {
                                timelineEvents.push({
                                    id: `feedback-${p.id}-${idx}`,
                                    type: 'feedback',
                                    projectName: p.name,
                                    author: f.author || 'Client',
                                    text: f.notes || f.text || 'Added new revision notes.',
                                    date: new Date(f.date).toISOString(),
                                });
                            });
                        }
                    });

                    // 2. Completed Tasks
                    tasks.filter(t => t.status === 'Completed').forEach(t => {
                        timelineEvents.push({
                            id: `task-${t.id}`,
                            type: 'task',
                            projectName: 'Task Management',
                            author: t.assignee || 'System',
                            text: `Completed task: ${t.title}`,
                            // If completedAt isn't saved, fallback to dueDate or now
                            date: new Date(t.dueDate || Date.now()).toISOString(),
                        });
                    });

                    // 3. Asset Comments
                    if (assets && assets.length > 0) {
                        assets.forEach(asset => {
                            if (asset.comments && asset.comments.length > 0) {
                                asset.comments.forEach((c, idx) => {
                                    timelineEvents.push({
                                        id: `asset-comment-${asset.id}-${idx}`,
                                        type: 'comment',
                                        projectName: 'Asset Feedback',
                                        author: c.author || 'User',
                                        text: c.text,
                                        date: new Date(c.timestamp || Date.now()).toISOString(),
                                    });
                                });
                            }
                        });
                    }

                    // Sort descending by date
                    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const recentEvents = timelineEvents.slice(0, 10);

                    if (recentEvents.length === 0) {
                        return (
                            <div className="empty-state-activity">
                                <MessageSquare size={32} />
                                <p>{t('no_recent_activity', 'No recent feedback activity.')}</p>
                            </div>
                        );
                    }

                    return recentEvents.map((activity) => (
                        <div key={activity.id} className="activity-card group">
                            <div className="activity-card-header">
                                <div className="activity-card-title-group">
                                    <div className="activity-icon-container">
                                        <MessageSquare size={14} />
                                    </div>
                                    <div>
                                        <span className="activity-project-name">{activity.projectName}</span>
                                        <span className="activity-date">
                                            <Clock size={10} style={{ marginRight: '4px' }} />
                                            {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="activity-card-body">
                                <p className="activity-author">{getEmployeeName(activity.author)}</p>
                                <p className="activity-text">{activity.text}</p>
                            </div>
                        </div>
                    ));
                })()}
            </div>
        </section>
    );

    const renderModule = (moduleId) => {
        switch (moduleId) {
            case 'daily-tasks': return renderDailyTasksWidget();
            case 'analytics': return renderAnalyticsModule();
            case 'recent-projects': return renderRecentProjectsModule();
            case 'activity-feed': return renderActivityFeedModule();
            default: return null;
        }
    };

    return (
        <motion.div
            className="dashboard-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        {userRole === 'client' ? t('client_portal', 'Client Portal') : t('studio_overview', 'Studio Overview')}
                    </h1>
                    <p className="page-subtitle mb-2">{t('welcome_back', 'Welcome back')}, {currentUser?.name || 'User'}</p>
                    {userRole === 'admin' && (
                        <button
                            className={`flex items-center gap-1.5 transition-colors text-[13px] font-medium ${isEditMode ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setIsEditMode(!isEditMode)}
                            title={isEditMode ? t('save_layout', 'Save Dashboard Layout') : t('edit_layout', 'Edit Dashboard Layout')}
                        >
                            {isEditMode ? <Check size={14} /> : <Settings2 size={14} />}
                            <span>{isEditMode ? t('save_layout_btn', 'Save Layout') : t('edit_layout_btn', 'Edit Layout')}</span>
                        </button>
                    )}
                </div>
                {userRole === 'admin' && (
                    <div className="flex items-center gap-4">
                        <button className="btn btn-primary shadow-lg shadow-primary/20" onClick={() => setIsProjectModalOpen(true)}>
                            <span>+ {t('new_project', 'New Project')}</span>
                        </button>
                    </div>
                )}
            </header>

            {renderStatsModule()}

            <div className="dashboard-content w-full">
                {(() => {
                    const availableModules = dashboardModules || ['analytics', 'recent-projects', 'daily-tasks', 'activity-feed'];
                    // Filter out modules that are not applicable to the current user role
                    // and explicitly filter out 'stats' because it's rendered outside the drag-and-drop flow now
                    const activeModules = availableModules.filter(moduleId => {
                        if (moduleId === 'stats') return false;
                        const content = renderModule(moduleId);
                        return content !== null;
                    });

                    const renderListItems = (useReorder) => activeModules.map(moduleId => {
                        const content = renderModule(moduleId);
                        const spanClass = moduleId === 'recent-projects' ? 'widget-span-3' : moduleId === 'activity-feed' ? 'widget-span-1' : 'widget-span-4';

                        if (useReorder) {
                            return (
                                <Reorder.Item
                                    key={moduleId}
                                    value={moduleId}
                                    drag="y"
                                    className="relative w-full cursor-grab"
                                >
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full flex items-center justify-center cursor-grab text-[var(--text-primary)] z-20 shadow-lg hover:bg-[var(--hover-bg)] transition-colors" title="Drag to reorder module">
                                        <GripHorizontal size={14} />
                                    </div>
                                    <div className="pointer-events-none opacity-80">
                                        {content}
                                    </div>
                                </Reorder.Item>
                            );
                        }

                        return (
                            <div key={moduleId} className={`relative w-full h-full ${spanClass}`}>
                                {content}
                            </div>
                        );
                    });

                    if (isEditMode) {
                        return (
                            <Reorder.Group
                                axis="y"
                                values={activeModules}
                                onReorder={(newLayout) => {
                                    const hiddenModules = availableModules.filter(m => !activeModules.includes(m));
                                    updateDashboardModules([...newLayout, ...hiddenModules]);
                                }}
                                className="w-full flex flex-col gap-6 list-none p-0 m-0"
                            >
                                {renderListItems(true)}
                            </Reorder.Group>
                        );
                    }

                    return (
                        <div className="dashboard-widgets-grid w-full items-stretch">
                            {renderListItems(false)}
                        </div>
                    );
                })()}
            </div>

            <AddProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
            <EditTaskModal isOpen={editTaskModalOpen} onClose={() => setEditTaskModalOpen(false)} task={selectedTask} />
        </motion.div>
    );
};

export default Dashboard;
