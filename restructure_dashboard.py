import codecs

with codecs.open('src/pages/Dashboard.jsx', 'r', 'utf-8') as f:
    text = f.read()

# 1. replace useStore
text = text.replace(
    'const { projects: allProjects, metrics, currentUser, userRole, updateProjectStatus, dashboardLayout, updateDashboardLayout, tasks } = useStore();',
    'const { projects: allProjects, metrics, currentUser, userRole, updateProjectStatus, dashboardLayout, updateDashboardLayout, tasks, dashboardModules, updateDashboardModules } = useStore();'
)

# 2. replace the whole renderAdminStats to the end of the file.
start_str = "    const renderAdminStats = () => {"
start_idx = text.find(start_str)

new_content = """    const renderAdminStats = () => {
        const statsData = {
            'active-projects': { id: 'active-projects', title: "Active Projects", value: activeProjects.length, detail: "In Pipeline", icon: TrendingUp, trend: "up" },
            'completion-ratio': { id: 'completion-ratio', title: "Completion Ratio", value: `${Math.round((completedProjects.length / Math.max(displayProjects.length, 1)) * 100)}%`, detail: `${completedProjects.length} of ${displayProjects.length} total`, icon: CheckCircle, trend: "success" },
            'total-revenue': { id: 'total-revenue', title: "Total Revenue", value: `€${totalRevenue.toLocaleString()}`, detail: "YTD Collected", icon: Euro, trend: "success" },
            'outstanding': { id: 'outstanding', title: "Outstanding", value: `€${outstandingBalance.toLocaleString()}`, detail: "Needs collection", icon: Wallet, trend: "warning" }
        };

        return (
            <Reorder.Group
                axis="x"
                values={dashboardLayout}
                onReorder={updateDashboardLayout}
                className="stats-grid mb-6"
                style={{ listStyle: 'none', padding: 0 }}
            >
                {dashboardLayout.map(id => {
                    const stat = statsData[id];
                    if (!stat) return null;
                    return (
                        <Reorder.Item key={stat.id} value={stat.id} drag={isEditMode ? "x" : false} className="relative select-none h-full">
                            {isEditMode && (
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-glass border border-glass rounded-full flex items-center justify-center cursor-grab text-white z-20 shadow-lg hover:bg-accent-cyan transition-colors" title="Drag to reorder">
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
        <motion.section className="stats-grid mb-6" variants={containerVariants} initial="hidden" animate="show">
            <StatCard title="My Active Tasks" value={activeProjects.length} detail="Assigned to me" icon={Clock} trend="warning" />
            <StatCard title="My Completed" value={completedProjects.length} detail="Great job!" icon={CheckCircle} trend="success" />
        </motion.section>
    );

    const renderClientStats = () => (
        <motion.section className="stats-grid mb-6" variants={containerVariants} initial="hidden" animate="show">
            <StatCard title="Open Projects" value={activeProjects.length} detail="Currently in progress" icon={Clock} trend="warning" />
            <StatCard title="Completed Projects" value={completedProjects.length} detail="Delivered" icon={CheckCircle} trend="success" />
            <StatCard title="Pending Review" value={displayProjects.filter(p => p.status === 'Client Review').length} detail="Requires your feedback" icon={Users} trend="warning" />
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
                            <h2 className="section-title m-0">Project Status Distribution</h2>
                            <p className="analytics-subtitle">Volume by production phase</p>
                        </div>
                        <div className="analytics-tabs-container">
                            {['All', 'Month', 'Week'].map(tab => (
                                <button
                                    key={tab}
                                    className={`analytics-tab ${chartTimeFilter === tab ? 'active' : ''}`}
                                    onClick={() => setChartTimeFilter(tab)}
                                >
                                    {tab}
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
                                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
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
                                        return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#818cf8'} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-insights-sidebar">
                    <div className="analytics-sidebar-header">
                        <h2 className="section-title m-0">Period Insights</h2>
                        <p className="analytics-subtitle">Data for: <span className="highlight-cyan">{chartTimeFilter === 'All' ? 'All Time' : `This ${chartTimeFilter}`}</span></p>
                    </div>
                    <div className="analytics-insights-content">
                        <div className="insight-card">
                            <div className="insight-label">Total In Pipeline</div>
                            <div className="insight-value">{totalInPeriod}</div>
                        </div>
                        <div className="insight-card">
                            <div className="insight-label">Completed</div>
                            <div className="insight-value-group">
                                <div className="insight-value success">{completedInPeriod}</div>
                                <div className="insight-badge success">
                                    {totalInPeriod > 0 ? Math.round((completedInPeriod / totalInPeriod) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                        <div className="insight-card">
                            <div className="insight-label">Bottleneck / Most Active</div>
                            <div className="insight-value highlight-purple">{mostActivePhase}</div>
                            <div className="insight-subtext">
                                {maxCount} <span>projects</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        );
    };

    const renderRecentProjectsModule = () => (
        <section className="recent-projects glass-panel w-full">
            <div className="section-header">
                <h2 className="section-title">
                    {userRole === 'client' ? 'Your Projects' : 'Active Production (Latest 10)'}
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
                        <option value="All">All Statuses</option>
                        <option value="Queue">Queue</option>
                        <option value="Modeling">Modeling</option>
                        <option value="Drafting">Drafting</option>
                        <option value="Client Review">Review</option>
                        <option value="Completed">Completed</option>
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
                        <option value="date">Sort: Newest</option>
                        <option value="name">Sort: Name</option>
                        <option value="client">Sort: Client</option>
                        <option value="progress">Sort: Progress</option>
                    </select>

                    {userRole !== 'client' && (
                        <Link to="/production" className="btn btn-ghost btn-sm no-underline text-inherit hover:text-white">View All</Link>
                    )}
                </div>
            </div>

            <motion.div className="project-list" variants={containerVariants} initial="hidden" animate="show">
                {recentProjects.length === 0 ? (
                    <div className="empty-state text-secondary p-4">No projects to display.</div>
                ) : (
                    recentProjects.map(project => (
                        <Link to={`/project/${project.id}`} key={project.id} className="block no-underline text-inherit">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
                                className="project-item items-center"
                            >
                                {/* Distinct PT Number Column */}
                                <div className="w-20 text-xs font-mono font-medium" style={{ color: 'var(--accent-cyan)' }}>
                                    {project.reference || 'PT----'}
                                </div>

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
                                            <option value="Queue">Queue</option>
                                            <option value="Modeling">Modeling</option>
                                            <option value="Drafting">Drafting</option>
                                            <option value="Client Review">Review</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    ) : (
                                        <div className="status-badge">{project.status}</div>
                                    )}
                                </div>

                                <div className="project-meta-col flex items-center justify-end text-sm text-secondary gap-6 w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="opacity-70" />
                                        <span>{project.assignee}</span>
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
        <section className="activity-feed glass-panel w-full">
            <div className="section-header">
                <h2 className="section-title">Recent Activity</h2>
            </div>
            <div className="activity-list" style={{ maxHeight: '650px', overflowY: 'auto', padding: '1rem' }}>
                {(() => {
                    // Only pull real feedback events
                    const timelineEvents = [];

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

                    // Sort descending by date
                    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const recentEvents = timelineEvents.slice(0, 10);

                    if (recentEvents.length === 0) {
                        return (
                            <div className="empty-state-activity">
                                <MessageSquare size={32} />
                                <p>No recent feedback activity.</p>
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
                                <p className="activity-author">{activity.author}</p>
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
            case 'stats': return renderStatsModule();
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
                        {userRole === 'client' ? 'Client Portal' : 'Studio Overview'}
                    </h1>
                    <p className="page-subtitle">Welcome back, {currentUser?.name || 'User'}</p>
                </div>
                {userRole === 'admin' && (
                    <div className="flex items-center gap-3">
                        <button className="btn btn-primary" onClick={() => setIsProjectModalOpen(true)}>
                            <span>+ New Project</span>
                        </button>
                    </div>
                )}
            </header>

            {userRole === 'admin' && (
                <div className="flex justify-end mb-2 mr-2">
                    <button
                        className={`btn btn-sm transition-all ${isEditMode ? 'bg-[var(--accent-cyan)] bg-opacity-10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)] border-opacity-50 shadow-[var(--shadow-glow)]' : 'btn-ghost text-secondary hover:text-white'}`}
                        onClick={() => setIsEditMode(!isEditMode)}
                        title={isEditMode ? "Save Dashboard Layout" : "Edit Dashboard Layout"}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                        {isEditMode ? <Check size={14} /> : <Settings2 size={14} />}
                        <span>{isEditMode ? 'Save Layout' : 'Edit Layout'}</span>
                    </button>
                </div>
            )}

            <div className="dashboard-content w-full flex flex-col gap-6">
                <Reorder.Group
                    axis="y"
                    values={dashboardModules}
                    onReorder={updateDashboardModules}
                    style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}
                >
                    {dashboardModules.map(moduleId => {
                        const content = renderModule(moduleId);
                        if (!content) return null;

                        return (
                            <Reorder.Item 
                                key={moduleId} 
                                value={moduleId} 
                                drag={isEditMode ? "y" : false} 
                                className={`relative w-full ${isEditMode ? 'cursor-grab' : ''}`}
                            >
                                {isEditMode && moduleId !== 'stats' && (
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-glass border border-glass rounded-full flex items-center justify-center cursor-grab text-white z-20 shadow-lg hover:bg-accent-cyan transition-colors" title="Drag to reorder module">
                                        <GripHorizontal size={14} />
                                    </div>
                                )}
                                {content}
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            </div>

            <AddProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
        </motion.div>
    );
};

export default Dashboard;
"""

text = text[:start_idx] + new_content

with codecs.open('src/pages/Dashboard.jsx', 'w', 'utf-8') as f:
    f.write(text)

print("Dashboard rewritten successfully")
