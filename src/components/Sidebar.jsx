import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, KanbanSquare, FolderKanban, Settings, LogOut, CheckSquare, DollarSign, MessageSquare, ChevronLeft, ChevronRight, Network, Magnet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';
import { useStore } from '../store';

const DotMatrixIcon = () => (
    <svg width="24" height="24" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="1.5" cy="0.5" r="0.4" fill="#FF6B00" />
        <circle cx="2.5" cy="0.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="0.5" r="0.4" fill="#FF6B00" />
        <circle cx="2.5" cy="1.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="1.5" r="0.4" fill="#FF6B00" />
        <circle cx="4.5" cy="1.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="2.5" r="0.4" fill="#FF6B00" />
        <circle cx="4.5" cy="2.5" r="0.4" fill="#FF6B00" />
        <circle cx="5.5" cy="2.5" r="0.4" fill="#FF6B00" />
        <circle cx="4.5" cy="3.5" r="0.4" fill="#FF6B00" />
        <circle cx="5.5" cy="3.5" r="0.4" fill="#FF6B00" />
        <circle cx="6.5" cy="3.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="4.5" r="0.4" fill="#FF6B00" />
        <circle cx="4.5" cy="4.5" r="0.4" fill="#FF6B00" />
        <circle cx="5.5" cy="4.5" r="0.4" fill="#FF6B00" />
        <circle cx="2.5" cy="5.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="5.5" r="0.4" fill="#FF6B00" />
        <circle cx="4.5" cy="5.5" r="0.4" fill="#FF6B00" />
        <circle cx="1.5" cy="6.5" r="0.4" fill="#FF6B00" />
        <circle cx="2.5" cy="6.5" r="0.4" fill="#FF6B00" />
        <circle cx="3.5" cy="6.5" r="0.4" fill="#FF6B00" />

        {/* White dots */}
        <circle cx="0.5" cy="0.5" r="0.4" fill="#FFFFFF" />
        <circle cx="4.5" cy="0.5" r="0.4" fill="#FFFFFF" />
        <circle cx="5.5" cy="0.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="0.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="1.5" r="0.4" fill="#FFFFFF" />
        <circle cx="1.5" cy="1.5" r="0.4" fill="#FFFFFF" />
        <circle cx="5.5" cy="1.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="1.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="2.5" r="0.4" fill="#FFFFFF" />
        <circle cx="1.5" cy="2.5" r="0.4" fill="#FFFFFF" />
        <circle cx="2.5" cy="2.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="2.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="3.5" r="0.4" fill="#FFFFFF" />
        <circle cx="1.5" cy="3.5" r="0.4" fill="#FFFFFF" />
        <circle cx="2.5" cy="3.5" r="0.4" fill="#FFFFFF" />
        <circle cx="3.5" cy="3.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="4.5" r="0.4" fill="#FFFFFF" />
        <circle cx="1.5" cy="4.5" r="0.4" fill="#FFFFFF" />
        <circle cx="2.5" cy="4.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="4.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="5.5" r="0.4" fill="#FFFFFF" />
        <circle cx="1.5" cy="5.5" r="0.4" fill="#FFFFFF" />
        <circle cx="5.5" cy="5.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="5.5" r="0.4" fill="#FFFFFF" />

        <circle cx="0.5" cy="6.5" r="0.4" fill="#FFFFFF" />
        <circle cx="4.5" cy="6.5" r="0.4" fill="#FFFFFF" />
        <circle cx="5.5" cy="6.5" r="0.4" fill="#FFFFFF" />
        <circle cx="6.5" cy="6.5" r="0.4" fill="#FFFFFF" />
    </svg>
);

const Sidebar = () => {
    const { t } = useTranslation();
    const userRole = useStore(state => state.userRole);
    const logout = useStore(state => state.logout);
    const messages = useStore(state => state.messages);
    const currentUser = useStore(state => state.currentUser);
    const mobileMenuOpen = useStore(state => state.mobileMenuOpen);
    const setMobileMenuOpen = useStore(state => state.setMobileMenuOpen);

    const navItems = [
        { path: '/dashboard', label: t('nav_dashboard', 'Overview'), icon: LayoutDashboard },
        { path: '/tasks', label: t('nav_tasks', 'Daily Tasks'), icon: CheckSquare },
        { path: '/pipeline', label: t('nav_pipeline', 'Sales Pipeline'), icon: Network },
        { path: '/leads', label: t('nav_lead_generator', 'Find Leads'), icon: Magnet },
        { path: '/clients', label: t('nav_clients', 'Client List'), icon: Users },
        { path: '/production', label: t('nav_production', 'Production Board'), icon: KanbanSquare },
        { path: '/financials', label: t('nav_financials', 'Financials'), icon: DollarSign },
        { path: '/assets', label: t('nav_assets', 'Project Hub'), icon: FolderKanban },
        { path: '/messenger', label: t('nav_messenger', 'Messenger'), icon: MessageSquare },
    ];

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    const handleLogout = () => {
        logout();
    };

    const unreadCount = !currentUser?.name ? 0 : (messages || []).filter(m =>
        m.channelId &&
        m.channelId.includes(currentUser.name) &&
        m.sender !== currentUser.name &&
        m.read === false
    ).length;

    const filteredNavItems = navItems.filter(item => {
        if (userRole === 'client') {
            return item.path === '/dashboard' || item.path === '/assets';
        }
        if (userRole === 'employee') {
            return item.path === '/dashboard' || item.path === '/tasks' || item.path === '/production' || item.path === '/assets' || item.path === '/messenger' || item.path === '/leads';
        }
        return true; // Admin sees all
    });

    return (
        <>
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            <aside className={`sidebar select-none ${isCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                <NavLink to="/dashboard" className="block w-full h-full flex justify-center items-center">
                    <div className="brand-logo-container">
                        <img
                            src="https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png"
                            alt="Progressive Technologies"
                            className="brand-logo-full cursor-pointer"
                        />
                        <div className="brand-logo-icon">
                            <DotMatrixIcon />
                        </div>
                    </div>
                </NavLink>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute right-[-14px] top-6 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-full p-1 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-border)] transition-colors z-50 shadow-md backdrop-blur-md"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isMessenger = item.path === '/messenger';
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 1024) setMobileMenuOpen(false); }}
                        >
                            <Icon className="nav-icon" size={20} />
                            <span className="nav-label">{item.label}</span>
                            {isMessenger && unreadCount > 0 && (
                                <>
                                    <span className="messenger-badge-full">{unreadCount}</span>
                                    <span className="messenger-badge-dot"></span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <NavLink 
                    to="/settings" 
                    className={({ isActive }) => `nav-link btn-ghost w-full justify-start mt-auto ${isActive ? 'active' : ''}`}
                    onClick={() => { if (window.innerWidth <= 1024) setMobileMenuOpen(false); }}
                >
                    <Settings className="nav-icon" size={20} />
                    <span className="nav-label">{t('nav_settings', 'Settings')}</span>
                </NavLink>
                <button className="nav-link btn-ghost w-full justify-start mt-2" onClick={handleLogout}>
                    <LogOut className="nav-icon" size={20} />
                    <span className="nav-label">{t('logout', 'Logout')}</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
