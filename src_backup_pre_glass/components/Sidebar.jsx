import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, KanbanSquare, FolderKanban, Settings, LogOut, CheckSquare, DollarSign, MessageSquare } from 'lucide-react';
import './Sidebar.css';
import { useStore } from '../store';

const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
    { path: '/pipeline', label: 'Sales Pipeline', icon: Users },
    { path: '/clients', label: 'Client List', icon: Users },
    { path: '/production', label: 'Production Board', icon: KanbanSquare },
    { path: '/financials', label: 'Financials', icon: DollarSign },
    { path: '/assets', label: 'Project Hub', icon: FolderKanban },
    { path: '/messenger', label: 'Messenger', icon: MessageSquare },
];

const Sidebar = () => {
    const userRole = useStore(state => state.userRole);
    const logout = useStore(state => state.logout);
    const messages = useStore(state => state.messages);
    const currentUser = useStore(state => state.currentUser);

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
            return item.path === '/dashboard' || item.path === '/tasks' || item.path === '/production' || item.path === '/assets' || item.path === '/messenger';
        }
        return true; // Admin sees all
    });

    return (
        <aside className="sidebar select-none">
            <div className="sidebar-brand">
                <NavLink to="/dashboard" className="block w-full h-full">
                    <img
                        src="https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png"
                        alt="Progressive Technologies"
                        className="brand-logo-img cursor-pointer"
                    />
                </NavLink>
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
                        >
                            <Icon className="nav-icon" size={20} />
                            <span className="nav-label">{item.label}</span>
                            {isMessenger && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center">{unreadCount}</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className={({ isActive }) => `nav-link btn-ghost w-full justify-start mt-auto ${isActive ? 'active' : ''}`}>
                    <Settings className="nav-icon" size={20} />
                    <span className="nav-label">Settings</span>
                </NavLink>
                <button className="nav-link btn-ghost w-full justify-start mt-2" onClick={handleLogout}>
                    <LogOut className="nav-icon" size={20} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
