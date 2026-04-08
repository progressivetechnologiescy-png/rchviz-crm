import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Send, Image as ImageIcon, CheckCheck, Check, Plus, Smile, ArrowLeft, MessageSquare } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { NavLink } from 'react-router-dom';
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
    const { messages, addMessage, currentUser, employees, markMessagesAsRead } = useStore();
    const [activeDmId, setActiveDmId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
            <aside className="sidebar select-none min-h-screen shrink-0 relative z-20" style={{ background: 'linear-gradient(180deg, rgba(16,34,34,0.7) 0%, rgba(5,11,11,0.8) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
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
                    <NavLink to="/dashboard" className="nav-link mb-4">
                        <ArrowLeft size={18} className="nav-icon text-slate-400" />
                        <span className="nav-label font-bold text-[13px] uppercase tracking-wider">Dashboard</span>
                    </NavLink>

                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 px-3 mt-2">Team Chat</div>

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
                                            {lastMsg ? lastMsg.text || 'Image' : 'Start chatting...'}
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
                                    {activeUser.isOnline ? 'Active Now' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Messages List - Telegram Style */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 custom-scrollbar scroll-smooth relative z-0">
                        {activeMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                <MessageSquare size={48} className="opacity-30" />
                                <p>Start your conversation with <strong>{activeUser.name}</strong></p>
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
                                title="Attach Image"
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
                                placeholder="Message..."
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
                </main>
            ) : (
                <main className="flex-1 flex flex-col items-center justify-center text-slate-500 relative bg-transparent">
                    <MessageSquare size={48} className="opacity-20 mb-4" />
                    <p>Select a team member to start chatting.</p>
                </main>
            )
            }
        </motion.div >
    );
};

export default Messenger;
