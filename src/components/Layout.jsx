import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { MessageSquare, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const isMessenger = location.pathname.startsWith('/messenger');
    const messages = useStore(state => state.messages);
    const currentUser = useStore(state => state.currentUser);
    const [toast, setToast] = React.useState({ show: false, message: '', sender: '' });
    const prevMsgCountRef = React.useRef(messages?.length || 0);

    React.useEffect(() => {
        if (!messages || !currentUser) return;

        if (messages.length > prevMsgCountRef.current) {
            const lastMsg = messages[messages.length - 1];
            // Only notify if we didn't send it
            if (lastMsg.sender !== currentUser.name) {
                setToast({ show: true, message: lastMsg.text, sender: lastMsg.sender });
                const timer = setTimeout(() => setToast({ show: false, message: '', sender: '' }), 4000);
                return () => clearTimeout(timer);
            }
        }
        prevMsgCountRef.current = messages.length;
    }, [messages, currentUser]);

    return (
        <div className="layout-container relative">
            {!isMessenger && <Sidebar />}
            <div className={`layout-main ${isMessenger ? 'messenger-layout' : ''}`}>
                {!isMessenger && <Header />}
                <main className={isMessenger ? "flex-1 w-full h-full overflow-hidden" : "layout-content"}>
                    {children}
                </main>
            </div>

            {/* Global Message Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[100] max-w-sm w-full glass-panel p-4 flex gap-4 shadow-xl border-primary/20"
                    >
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <MessageSquare className="text-primary" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white mb-1">{t('new_message_from', 'New Message from')} {toast.sender}</h4>
                            <p className="text-sm text-slate-300 truncate">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast({ show: false, message: '', sender: '' })}
                            className="text-slate-500 hover:text-white shrink-0 self-start"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
