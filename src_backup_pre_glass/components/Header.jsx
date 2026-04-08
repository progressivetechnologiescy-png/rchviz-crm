import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, CloudSun, HelpCircle, CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, currentUser, userRole, notifications, markAllNotificationsRead, markNotificationRead, toggleNotificationRead, messages, markAllMessagesAsRead } = useStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
    const allUserMessages = !currentUser?.name ? [] : (messages || []).filter(m =>
        m.sender !== currentUser.name
    );
    const unreadMsgCount = !currentUser?.name ? 0 : (messages || []).filter(m =>
        m.sender !== currentUser.name &&
        m.read === false
    ).length;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        setShowMessages(false);
    };

    const handleMessagesClick = () => {
        setShowMessages(!showMessages);
        setShowNotifications(false);
    };

    const notifRef = useRef(null);
    const msgRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (msgRef.current && !msgRef.current.contains(event.target)) {
                setShowMessages(false);
            }
        };

        if (showNotifications || showMessages) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications, showMessages]);

    // Fallbacks just in case
    const name = currentUser?.name || 'Guest User';
    const roleText = userRole ? userRole.toUpperCase() : 'UNKNOWN ROLE';
    const initials = name.substring(0, 2).toUpperCase();

    return (
        <header className="header glass-panel">

            <div className="header-search">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search projects, clients..."
                    className="search-input"
                />
            </div>

            <div className="header-actions">
                <div className="header-widget">
                    <div className="weather-section">
                        <CloudSun className="weather-icon" size={20} />
                        <div className="weather-info">
                            <span className="weather-temp">24°C</span>
                            <span className="weather-loc">Limassol</span>
                        </div>
                    </div>
                    <div className="time-section">
                        <span className="time-text">{formatTime(currentTime)}</span>
                        <span className="date-text">{formatDate(currentTime)}</span>
                    </div>
                </div>

                <Link to="/help" className="action-btn" title="Help">
                    <HelpCircle size={20} />
                </Link>

                <div className="notifications-wrapper relative" ref={msgRef}>
                    <button className="action-btn relative" onClick={handleMessagesClick} title="Messages">
                        <MessageSquare size={20} />
                        {unreadMsgCount > 0 && <span className="notification-badge">{unreadMsgCount}</span>}
                    </button>
                    {showMessages && (
                        <div className="notifications-dropdown">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/90 backdrop-blur-md">
                                <h4 className="font-semibold text-[var(--accent-cyan)]">Messages</h4>
                                {unreadMsgCount > 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors border border-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/50 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllMessagesAsRead();
                                        }}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notification-list p-3 space-y-3">
                                {allUserMessages.length > 0 ? (
                                    allUserMessages.slice(-5).reverse().map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`block p-4 rounded-xl transition-all border relative group cursor-pointer ${msg.read ? 'bg-[var(--bg-primary)]/50 border-transparent opacity-70 hover:opacity-100 hover:bg-[var(--hover-bg)] hover:border-[var(--glass-border)]' : 'bg-[var(--bg-secondary)] border-[var(--status-danger)]/30 shadow-[0_4px_15px_rgba(244,63,94,0.05)] hover:bg-[var(--hover-bg)] hover:border-[var(--status-danger)]/50 hover:-translate-y-0.5'}`}
                                            onClick={() => {
                                                navigate('/messenger');
                                                setShowMessages(false);
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <div className="text-sm font-semibold group-hover:underline text-[var(--accent-cyan)] truncate">
                                                    {msg.sender === currentUser.name ? 'You' : msg.sender}
                                                </div>
                                                <div className="text-xs text-[var(--text-tertiary)] shrink-0 mt-0.5">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pr-2 line-clamp-2">
                                                {msg.text || (msg.imageUrl ? 'Sent an attachment' : 'New message')}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-secondary flex flex-col items-center gap-2">
                                        <MessageSquare size={24} className="opacity-20 mx-auto" />
                                        <span>No recent messages</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-[var(--glass-border)] bg-[var(--bg-primary)]/50 rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        navigate('/messenger');
                                        setShowMessages(false);
                                    }}
                                    className="w-full text-center text-xs text-[var(--accent-cyan)] hover:text-white py-2 opacity-80 hover:opacity-100 transition-colors"
                                >
                                    Open Messenger
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button className="action-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="notifications-wrapper relative" ref={notifRef}>
                    <button className="action-btn relative" onClick={handleNotificationClick}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/90 backdrop-blur-md">
                                <h4 className="font-semibold text-[var(--accent-cyan)]">Notifications</h4>
                                {unreadCount > 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors border border-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/50 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllNotificationsRead();
                                        }}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notification-list p-3 space-y-3">
                                {notifications && notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`block p-4 rounded-xl transition-all border relative group cursor-pointer ${notification.read ? 'bg-[var(--bg-primary)]/50 border-transparent opacity-70 hover:opacity-100 hover:bg-[var(--hover-bg)] hover:border-[var(--glass-border)]' : 'bg-[var(--bg-secondary)] border-[var(--accent-cyan)]/30 shadow-[0_4px_15px_rgba(0,240,255,0.05)] hover:bg-[var(--hover-bg)] hover:border-[var(--accent-cyan)]/50 hover:-translate-y-0.5'}`}
                                            onClick={() => {
                                                markNotificationRead(notification.id);
                                                navigate(notification.link);
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div
                                                    className={`text-sm font-semibold group-hover:underline ${notification.read ? 'font-medium' : ''}`}
                                                    style={{ color: notification.read ? 'var(--text-secondary)' : 'var(--accent-cyan)' }}
                                                >
                                                    {notification.title}
                                                </div>
                                                <button
                                                    className={`rounded-full shrink-0 transition-all outline-none focus:outline-none flex cursor-pointer pointer-events-auto ${notification.read ? 'bg-transparent hover:border-[var(--accent-cyan)]' : 'bg-[var(--accent-cyan)]'}`}
                                                    style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        minWidth: '12px',
                                                        minHeight: '12px',
                                                        borderRadius: '50%',
                                                        border: notification.read ? '1.5px solid var(--text-tertiary)' : '1.5px solid var(--accent-cyan)',
                                                        boxShadow: notification.read ? 'none' : '0 0 0 4px rgba(0, 240, 255, 0.2)',
                                                        marginTop: '4px'
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleNotificationRead(notification.id);
                                                    }}
                                                    title={notification.read ? "Mark as unread" : "Mark as read"}
                                                />
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pr-2">{notification.desc}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-secondary">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <div className="avatar">
                        <span className="avatar-text">{initials}</span>
                    </div>
                    <div className="user-info">
                        <span className="user-name">{name}</span>
                        <span className="user-role">{roleText}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
