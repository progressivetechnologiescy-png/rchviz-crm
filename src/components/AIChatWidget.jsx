import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, Mic } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import './AIChatWidget.css';

const AIChatWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const currentUser = useStore(state => state.currentUser);
    const [messages, setMessages] = useState([
        { id: 1, text: t('ai_greeting', `Hi {{name}}! I'm Protech AI. How can I help you today?`, { name: currentUser?.name || '' }), isBot: true, timestamp: new Date() }
    ]);
    const messagesEndRef = useRef(null);

    // Access CRM state to answer queries
    const projects = useStore(state => state.projects);
    const pipelineData = useStore(state => state.pipelineData);
    const clients = useStore(state => state.clients);
    const tasks = useStore(state => state.tasks);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (currentUser?.name) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[0].text = t('ai_greeting', `Hi {{name}}! I'm Protech AI. How can I help you today?`, { name: currentUser.name });
                return newMsgs;
            });
        }
    }, [currentUser?.name]);

    const processNLP = (query) => {
        const lowerQuery = query.toLowerCase();
        let response = t('ai_fallback', "I'm not sure how to answer that yet. Try asking about revenue, leads, or finding projects for a client.");

        // ... we don't translate logic or regex targets right now unless user requests full localized intent matching.
        // Returning translated responses though.
        if (/\b(revenue|revnue|money|paid|make|made|earn|earned|earnings|profit|έσοδα|χρήματα|budget)\b/.test(lowerQuery)) {
            const totalRevenue = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            response = t('ai_revenue_response', `Based on current project data, our total collected revenue is €{{totalPaid}}.`, { totalPaid: totalRevenue.toLocaleString() });
        }
        else if (/\b(outstanding|balance|owed|due|unpaid|υπόλοιπο|οφειλή)\b/.test(lowerQuery)) {
            const totalOutstanding = projects.reduce((sum, p) => sum + (p.balance || 0), 0);
            response = t('ai_outstanding_response', `We currently have €{{totalOutstanding}} in outstanding balances across all projects.`, { totalOutstanding: totalOutstanding.toLocaleString() });
        }
        else if (/\b(lead|leads|led|leds|pipeline|πελάτες|ευκαιρίες)\b/.test(lowerQuery)) {
            const inboxTasks = pipelineData?.columns['column-1']?.taskIds?.length || 0;
            const contactedTasks = pipelineData?.columns['column-2']?.taskIds?.length || 0;
            const numLeads = inboxTasks + contactedTasks;
            response = t('ai_leads_response', `We currently have {{numLeads}} active leads in the early stages of the pipeline.`, { numLeads });
        }
        else if (/\b(client|clients|customer|customers|account|accounts|πελάτης|πελάτες|how many clients do we have)\b/.test(lowerQuery)) {
            const numClients = clients?.length || 0;
            response = t('ai_clients_response', `We currently have {{numClients}} active clients mapped in the CRM.`, { numClients });
        }
        else if (/\b(find projects for|search client|projects for|βρες έργα|αναζήτηση)\b/.test(lowerQuery)) {
            // Extract a potential client name (very basic heuristic)
            const words = lowerQuery.split('for ');
            if (words.length > 1) {
                const searchClient = words[1].replace(/[^\w\s]/gi, '').trim();
                const found = projects.filter(p => p.client.toLowerCase().includes(searchClient));
                if (found.length > 0) {
                    response = t('ai_projects_found', `I found {{count}} project(s) for {{client}}: {{projects}}.`, {
                        count: found.length,
                        client: searchClient,
                        projects: found.map(f => `"${f.name}"`).join(', ')
                    });
                } else {
                    response = t('ai_projects_not_found', `I couldn't find any active projects for "{{client}}".`, { client: searchClient });
                }
            } else {
                response = t('ai_specify_client_name', "Please specify the client name, e.g., 'Find projects for Oikogenesis'.");
            }
        }
        else if (/\b(project|projects|έργα|έργο|active projects|total projects)\b/.test(lowerQuery)) {
            const numProjects = projects?.length || 0;
            const activeProjects = projects?.filter(p => p.status !== 'Completed' && p.status !== 'Cancelled').length || 0;
            response = t('ai_projects_count_response', `We currently have {{activeProjects}} active projects out of {{numProjects}} total projects.`, { activeProjects, numProjects });
        }
        else if (/\b(task|tasks|todo|δουλειές|υποχρεώσεις|εκκρεμότητες|what tasks do i have)\b/.test(lowerQuery)) {
            const pendingTasks = tasks?.filter(t => t.status === 'Pending') || [];
            const highPriorityTasks = pendingTasks.filter(t => t.priority === 'High');
            response = t('ai_tasks_response', `You currently have {{count}} pending task(s). {{highCount}} of them are High priority.`, { 
                count: pendingTasks.length, 
                highCount: highPriorityTasks.length 
            });
        }
        else if (/\b(hello|hi|hey|greetings|howdy|γεια|καλημέρα)\b/.test(lowerQuery)) {
            response = t('ai_hello_response', "Hello! Ask me to check our revenue, count our leads, or search for client projects.");
        }

        return response;
    };

    const handleVoiceRecord = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support voice recognition.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            text: inputValue,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate network delay for AI "thinking"
        setTimeout(() => {
            const aiResponse = processNLP(newUserMsg.text);
            const newBotMsg = {
                id: Date.now() + 1,
                text: aiResponse,
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newBotMsg]);
        }, 600);
    };

    return (
        <motion.div
            className="ai-widget-container"
            drag
            dragMomentum={false}
            style={{ cursor: 'grab' }}
            title="Drag to move"
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="ai-chat-window glass-panel"
                    >
                        {/* Header */}
                        <div className="ai-chat-header">
                            <div className="ai-chat-title">
                                <Bot size={20} style={{ color: 'var(--accent-cyan)' }} />
                                <h3>Protech AI</h3>
                            </div>
                            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="ai-chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`ai-message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                                    {msg.isBot && <div className="ai-avatar"><Sparkles size={14} /></div>}
                                    <div className={`ai-message-bubble ${msg.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                                        <p>{msg.text}</p>
                                        <span className="ai-timestamp">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form className="ai-chat-input-area" onSubmit={handleSend}>
                            <button
                                type="button"
                                className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={handleVoiceRecord}
                                title="Use Voice Command"
                            >
                                <Mic size={18} style={{
                                    color: isListening ? '#fb7185' : 'var(--text-secondary)',
                                    ...(isListening ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {})
                                }} />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={t('ai_chat_placeholder', "Ask AI about revenue, leads...")}
                                className="ai-chat-input"
                            />
                            <button type="submit" className="ai-send-btn" disabled={!inputValue.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && <span className="ai-badge">{t('ai_badge_text', 'AI')}</span>}
            </motion.button>
        </motion.div>
    );
};

export default AIChatWidget;
