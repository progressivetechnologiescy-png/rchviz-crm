import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Send, Image as ImageIcon, CheckCheck, Check, Plus, Smile, ArrowLeft, MessageSquare, PanelRight, ExternalLink } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const toGreekCaps = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
import '../components/Sidebar.css';
import './Messenger.css';

const pageVariants = {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: 20, scale: 0.98 }
};

const pageTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 25
};

const getDmId = (user1, user2) => [user1, user2].sort().join('-');

const Messenger = () => {
    const { t } = useTranslation();
    const { messages, addMessage, currentUser, employees, markMessagesAsRead } = useStore();
    const [activeDmId, setActiveDmId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMediaPanel, setShowMediaPanel] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const textareaRef = useRef(null);

    // Initial select
    useEffect(() => {
        if (!activeDmId && employees.length > 0) {
            const firstEmp = employees.find(e => e.name !== currentUser?.name);
            if (firstEmp && currentUser) {
                setActiveDmId(getDmId(currentUser.name, firstEmp.name));
            }
        }
    }, [employees, currentUser, activeDmId]);

    // Mark as read when entering chat
    useEffect(() => {
        if (activeDmId) {
            markMessagesAsRead(activeDmId);
        }
    }, [activeDmId, messages, markMessagesAsRead]);

    // Close emoji picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeMessages = messages.filter(m => m.channelId === activeDmId);
    const activeUserName = activeDmId ? activeDmId.replace(currentUser?.name, '').replace('-', '') : '';
    const activeUser = employees.find(e => e.name === activeUserName);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeMessages]);

    const handleSendMessage = (imageUrl = null) => {
        if ((!newMessage.trim() && !imageUrl) || !activeDmId) return;

        addMessage(activeDmId, {
            sender: currentUser.name,
            role: currentUser.role,
            text: newMessage.trim(),
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
        });
        setNewMessage('');
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSendMessage(reader.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getUnreadCount = (empName) => {
        if (!currentUser?.name) return 0;
        const dmId = getDmId(currentUser?.name, empName);
        return messages.filter(m => m.channelId === dmId && m.sender !== currentUser?.name && !m.read).length;
    };

    const filteredEmployees = employees.filter(e => e.name !== currentUser?.name);

    return (
        <motion.div
            className="flex h-screen w-full text-slate-900 dark:text-slate-100 antialiased overflow-hidden bg-transparent relative z-10"
            variants={pageVariants}
            transition={pageTransition}
            initial="initial"
            animate="in"
            exit="out"
        >
            {/* Conversations List / Main Menu exactly like Sidebar */}
            <aside className="sidebar select-none min-h-screen shrink-0 relative z-20" style={{ backgroundColor: 'transparent', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="sidebar-brand">
                    <NavLink to="/dashboard" className="block w-full h-full flex items-center justify-center">
                        <img
                            src="https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png"
                            alt="Progressive Technologies"
                            className="brand-logo-img cursor-pointer"
                        />
                    </NavLink>
                </div>

                <nav className="sidebar-nav overflow-y-auto scrollbar-hide pt-4">
                    <div className="px-3 mb-6 mt-2">
                        <NavLink to="/dashboard" className="btn w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 transition-all shadow-sm">
                            <ArrowLeft size={16} className="text-slate-400" />
                            <span className="text-[15px]">{t('back_to_dashboard', 'Back to Dashboard')}</span>
                        </NavLink>
                    </div>

                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 px-3 mt-2">{toGreekCaps(t('team_chat', 'Team Chat'))}</div>

                    {filteredEmployees.map(emp => {
                        const dmId = currentUser ? getDmId(currentUser.name, emp.name) : null;
                        const isActive = activeDmId === dmId;
                        const unread = getUnreadCount(emp.name);
                        const lastMsg = messages.filter(m => m.channelId === dmId).pop();

                        return (
                            <div
                                key={emp.id}
                                onClick={() => setActiveDmId(dmId)}
                                className={`nav-link cursor-pointer w-full flex items-center justify-between py-2 px-3 mb-1 ${isActive ? 'active' : ''}`}
                            >
                                <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                                    <div className="relative shrink-0">
                                        <div className="size-8 rounded-full bg-cover bg-center bg-slate-800 flex items-center justify-center text-white font-bold border border-primary/20 text-xs" data-alt={emp.name}>
                                            {emp.initials}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 size-2.5 border-2 border-[#091515] rounded-full ${emp.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="nav-label truncate block leading-tight">{emp.name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate mt-0.5 max-w-full">
                                            {lastMsg ? (lastMsg.text || t('image', 'Image')) : t('start_chatting', 'Start chatting...')}
                                        </div>
                                    </div>
                                </div>
                                {unread > 0 && (
                                    <div className="bg-[var(--accent-cyan)] text-black text-[10px] font-bold size-4 flex items-center justify-center rounded-full shrink-0">
                                        {unread}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Chat Area */}
            {activeUser ? (
                <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
                    {/* Header */}
                    <header className="h-[72px] shrink-0 border-b border-[var(--glass-border)] px-6 flex items-center justify-between bg-[var(--bg-secondary)]/80 backdrop-blur-md z-10 w-full">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-primary/20">
                                    {activeUser.initials}
                                </div>
                                <div className={`absolute bottom-0 right-0 size-3 border-2 border-[var(--bg-secondary)] rounded-full ${activeUser.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold">{activeUser.name}</h2>
                                <p className={`text-[11px] font-medium ${activeUser.isOnline ? 'text-green-500' : 'text-slate-500'}`}>
                                    {activeUser.isOnline ? t('active_now', 'Active Now') : t('offline', 'Offline')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowMediaPanel(!showMediaPanel)}
                                className={`p-2 rounded-lg transition-colors ${showMediaPanel ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={t('media_info', 'Media Info')}
                            >
                                <PanelRight size={20} />
                            </button>
                            <button
                                onClick={() => window.open('/messenger', '_blank', 'width=1200,height=800')}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                title={t('open_in_new_window', 'Open in New Window')}
                            >
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden w-full relative">
                        <div className="flex-1 flex flex-col min-w-0 relative h-full">
                            {/* Messages List - Telegram Style */}
                            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 custom-scrollbar scroll-smooth relative z-0">
                                {activeMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                        <MessageSquare size={48} className="opacity-30" />
                                        <p>{t('start_conversation_with', 'Start your conversation with')} <strong>{activeUser.name}</strong></p>
                                    </div>
                                ) : (
                                    activeMessages.map((msg, idx) => {
                                        const prevMsg = idx > 0 ? activeMessages[idx - 1] : null;
                                        const isMe = msg.sender === currentUser?.name;
                                        const isConsecutive = prevMsg && prevMsg.sender === msg.sender && (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) < 60000;

                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
                                                <div className={`max-w-[75%] flex flex-col relative group ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2.5 shadow-md flex flex-col ${isMe
                                                        ? `bg-[#2b5278] border border-[#3b6a96]/50 text-white ${isConsecutive ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tr-sm'}`
                                                        : `bg-[#182533] border border-white/5 text-gray-100 ${isConsecutive ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl rounded-tl-sm'}`
                                                        }`}>
                                                        {msg.imageUrl && (
                                                            <img src={msg.imageUrl} alt="Attachment" className="max-w-xs md:max-w-sm rounded-lg mb-1 mt-1 object-cover cursor-pointer" />
                                                        )}
                                                        {msg.text && <p className="text-[15px] whitespace-pre-wrap leading-snug break-words">{msg.text}</p>}

                                                        {/* Inline Telegram-style timestamp */}
                                                        <div className="empty:hidden flex items-center justify-end gap-1 mt-1 -mr-1 -mb-1 opacity-70">
                                                            <span className="text-[10px] leading-none pt-0.5">{formatTime(msg.timestamp)}</span>
                                                            {isMe && (
                                                                <span className="pt-0.5 flex">
                                                                    {msg.read ? <CheckCheck size={14} className="text-[#51bbed]" /> : <Check size={14} />}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Input Area */}
                            <div className="px-6 pb-6 pt-2 shrink-0 z-10 mx-auto w-full max-w-4xl">
                                <div className="relative flex items-center bg-[#1c222b] rounded-[24px] pr-2 pl-4 py-1 border border-white/5 shadow-lg max-h-32 transition-all focus-within:border-[var(--glass-border)]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAttachmentClick();
                                        }}
                                        className="p-2 text-slate-400 hover:text-white transition-colors shrink-0"
                                        title={t('attach_image', 'Attach Image')}
                                    >
                                        <Plus size={22} />
                                    </button>

                                    <textarea
                                        ref={textareaRef}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={t('message_placeholder', 'Message...')}
                                        className="flex-1 bg-transparent border-none text-white text-[15px] placeholder-slate-500 focus:outline-none resize-none px-3 py-3 m-0 min-h-[44px] max-h-24 custom-scrollbar"
                                        rows={1}
                                    />

                                    <div className="flex items-center gap-1 shrink-0">
                                        <AnimatePresence>
                                            {showEmojiPicker && (
                                                <motion.div
                                                    ref={emojiPickerRef}
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute bottom-[calc(100%+12px)] right-0 z-50 shadow-2xl"
                                                >
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiClick}
                                                        theme="dark"
                                                        searchDisabled={false}
                                                        skinTonesDisabled
                                                        width={300}
                                                        height={350}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`p-2 transition-colors shrink-0 ${showEmojiPicker ? 'text-[var(--accent-cyan)]' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Smile size={22} />
                                        </button>

                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={!newMessage.trim()}
                                            className={`size-10 rounded-full flex items-center justify-center transition-all shrink-0 ml-1 ${newMessage.trim()
                                                ? 'bg-[var(--accent-cyan)] text-[#050b0b] hover:bg-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                                : 'bg-transparent text-slate-500 scale-90'
                                                }`}
                                        >
                                            <Send size={18} className={newMessage.trim() ? "ml-0.5" : ""} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media Panel */}
                        <AnimatePresence>
                            {showMediaPanel && (
                                <motion.aside
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 320, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="border-l border-[var(--glass-border)] bg-[var(--bg-primary)]/40 backdrop-blur-md flex flex-col overflow-hidden shrink-0 z-10 hidden md:flex h-full"
                                >
                                    <div className="p-5 border-b border-[var(--glass-border)] shrink-0 bg-[var(--bg-secondary)]/50">
                                        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                            <ImageIcon size={16} className="text-accent-cyan" />
                                            {t('shared_media', 'Shared Media')}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">{t('photos_shared_in_chat', '{{count}} Photos shared in this chat', { count: activeMessages.filter(m => m.imageUrl).length })}</p>
                                    </div>
                                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeMessages.filter(m => m.imageUrl).reverse().map(msg => (
                                                <div key={msg.id} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group cursor-pointer shadow-sm" onClick={() => window.open(msg.imageUrl, '_blank')}>
                                                    <img src={msg.imageUrl} alt="Shared media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                        {activeMessages.filter(m => m.imageUrl).length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-60">
                                                <ImageIcon size={32} className="mb-3" />
                                                <p className="text-sm">{t('no_media_shared', 'No media shared yet')}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            ) : (
                <main className="flex-1 flex flex-col items-center justify-center text-slate-500 relative bg-transparent">
                    <MessageSquare size={48} className="opacity-20 mb-4" />
                    <p>{t('select_team_member_to_chat', 'Select a team member to start chatting.')}</p>
                </main>
            )}
        </motion.div>
    );
};

export default Messenger;
