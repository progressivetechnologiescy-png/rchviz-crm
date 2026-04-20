import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell, Sun, Moon, CloudSun, HelpCircle, CheckCircle2, Circle, MessageSquare, Globe, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme, currentUser, userRole, notifications, markAllNotificationsRead, markNotificationRead, toggleNotificationRead, messages, markAllMessagesAsRead, projects, clients, toggleMobileMenu } = useStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [temperature, setTemperature] = useState('--');
    const [weatherCode, setWeatherCode] = useState(0); // 0 corresponds to clear skies / Sun
    const searchRef = useRef(null);

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'el' ? 'en' : 'el');
    };

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
        
        // Fetch real-time weather for Limassol, Cyprus
        const fetchWeather = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.6841&longitude=33.0379&current_weather=true');
                if (res.ok) {
                    const data = await res.json();
                    setTemperature(Math.round(data.current_weather.temperature).toString());
                    setWeatherCode(data.current_weather.weathercode);
                }
            } catch (err) {
                console.error("Failed to fetch weather data", err);
            }
        };
        fetchWeather();
        // Refresh weather every 30 mins
        const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);

        return () => {
            clearInterval(timer);
            clearInterval(weatherTimer);
        };
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

    useEffect(() => {
        const handleClickOutsideSearch = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        if (showResults) {
            document.addEventListener('mousedown', handleClickOutsideSearch);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideSearch);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideSearch);
        };
    }, [showResults]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const matchedProjects = (projects || []).filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.client && p.client.toLowerCase().includes(query)) ||
            (p.clientName && p.clientName.toLowerCase().includes(query)) ||
            (p.reference && p.reference.toLowerCase().includes(query)) ||
            (p.totalAmount && p.totalAmount.toString().includes(query))
        ).slice(0, 5).map(p => ({ ...p, resultType: 'project' }));

        const matchedClients = (clients || []).filter(c => 
            c.name.toLowerCase().includes(query) || 
            (c.email && c.email.toLowerCase().includes(query)) ||
            (c.company && c.company.toLowerCase().includes(query)) ||
            (c.phone && c.phone.toLowerCase().includes(query)) ||
            (c.contact && c.contact.toLowerCase().includes(query))
        ).slice(0, 5).map(c => ({ ...c, resultType: 'client' }));

        const combined = [...matchedProjects, ...matchedClients];
        setSearchResults(combined);
        setShowResults(true);

    }, [searchQuery, projects, clients]);

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery('');
        if (result.resultType === 'project') {
            navigate(`/project/${result.id}`);
        } else {
            navigate('/clients');
        }
    };

    // Fallbacks just in case
    const name = currentUser?.name || 'Guest User';
    const roleText = userRole ? userRole.toUpperCase() : 'UNKNOWN ROLE';
    const initials = name.substring(0, 2).toUpperCase();

    const toGreekCaps = (str) => {
        if (!str) return '';
        return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    return (
        <header className="header glass-panel">
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
                <Menu size={24} />
            </button>

            <div className="header-search relative" ref={searchRef}>
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.trim() && searchResults.length > 0) setShowResults(true) }}
                    placeholder={t('header_search_placeholder', 'Search projects, clients...')}
                    className="search-input"
                />
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full mt-2 left-0 w-[400px] notifications-dropdown z-50 overflow-hidden !right-auto"
                            style={{ padding: 0 }}
                        >
                            {searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((res, i) => (
                                        <div
                                            key={`${res.resultType}-${res.id}-${i}`}
                                            className="px-4 py-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors border-b border-[var(--glass-border)] last:border-0"
                                            onClick={() => handleResultClick(res)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                                                    {res.resultType === 'project' ? <Search size={14} /> : <span className="text-xs font-bold">{res.name.substring(0, 1)}</span>}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{res.name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)] truncate">
                                                        {res.resultType === 'project' ? `${t('project', 'Project')} • ${res.client || 'No Client'}` : `${t('client', 'Client')} • ${res.email || 'No Email'}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                                    {t('no_results_found', 'No results found for')} "{searchQuery}"
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="header-actions">
                <div className="header-widget">
                    <div className="weather-section">
                        {weatherCode <= 3 ? <Sun className="weather-icon" size={20} /> : <CloudSun className="weather-icon" size={20} />}
                        <div className="weather-info">
                            <span className="weather-temp">{temperature}°C</span>
                            <span className="weather-loc">Limassol</span>
                        </div>
                    </div>
                    <div className="time-section">
                        <span className="time-text">{formatTime(currentTime)}</span>
                        <span className="date-text">{formatDate(currentTime)}</span>
                    </div>
                </div>

                <button className="action-btn flex items-center justify-center" onClick={toggleLanguage} title={i18n.language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}>
                    <Globe size={18} />
                    <span className="text-xs font-bold ml-1.5">{toGreekCaps(i18n.language.substring(0, 2))}</span>
                </button>

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
                                <h4 className="font-semibold text-[var(--accent-cyan)] tracking-wider text-xs">{toGreekCaps(t('messages', 'Messages'))}</h4>
                                {unreadMsgCount > 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors border border-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/50 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllMessagesAsRead();
                                        }}
                                    >
                                        {t('mark_all_read', 'Mark all as read')}
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
                                    className="w-full text-center text-xs text-[var(--accent-cyan)] hover:text-white py-2 opacity-80 hover:opacity-100 transition-colors font-bold tracking-wider"
                                >
                                    {toGreekCaps(t('open_messenger', 'Open Messenger'))}
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
                                <h4 className="font-semibold text-[var(--accent-cyan)] tracking-wider text-xs">{toGreekCaps(t('notifications', 'Notifications'))}</h4>
                                {unreadCount > 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors border border-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/50 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllNotificationsRead();
                                        }}
                                    >
                                        {t('mark_all_read', 'Mark all as read')}
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
                    <div className={`avatar ${currentUser?.avatar ? 'has-image' : ''}`}>
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Profile Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                        ) : (
                            <span className="avatar-text">{initials}</span>
                        )}
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
