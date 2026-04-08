import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, Mic } from 'lucide-react';
import { useStore } from '../store';
import './AIChatWidget.css';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const currentUser = useStore(state => state.currentUser);
    const [messages, setMessages] = useState([
        { id: 1, text: `Hi ${currentUser?.name || ''}! I'm Protech AI. How can I help you today?`, isBot: true, timestamp: new Date() }
    ]);
    const messagesEndRef = useRef(null);

    // Access CRM state to answer queries
    const projects = useStore(state => state.projects);
    const pipelineData = useStore(state => state.pipelineData);

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
                newMsgs[0].text = `Hi ${currentUser.name}! I'm Protech AI. How can I help you today?`;
                return newMsgs;
            });
        }
    }, [currentUser?.name]);

    const processNLP = (query) => {
        const lowerQuery = query.toLowerCase();
        let response = "I'm not sure how to answer that yet. Try asking about revenue, leads, or finding projects for a client.";

        // Basic keyword matching with word boundaries to avoid false positives (e.g., 'this' matching 'hi')
        if (/\b(revenue|money|paid|make|made|earn|earned|earnings|profit)\b/.test(lowerQuery)) {
            const totalPaid = projects.reduce((sum, p) => sum + (p.financials?.paid || 0), 0);
            response = `Based on current project data, our total collected revenue is $${totalPaid.toLocaleString()}.`;
        }
        else if (/\b(lead|leads|led|leds|pipeline)\b/.test(lowerQuery)) {
            const inboxTasks = pipelineData?.columns['column-1']?.taskIds?.length || 0;
            const contactedTasks = pipelineData?.columns['column-2']?.taskIds?.length || 0;
            const numLeads = inboxTasks + contactedTasks;
            response = `We currently have ${numLeads} active leads in the early stages of the pipeline.`;
        }
        else if (/\b(find projects for|search client|projects for)\b/.test(lowerQuery)) {
            // Extract a potential client name (very basic heuristic)
            const words = lowerQuery.split('for ');
            if (words.length > 1) {
                const searchClient = words[1].replace(/[^\w\s]/gi, '').trim();
                const found = projects.filter(p => p.client.toLowerCase().includes(searchClient));
                if (found.length > 0) {
                    response = `I found ${found.length} project(s) for ${searchClient}: ${found.map(f => `"${f.name}"`).join(', ')}.`;
                } else {
                    response = `I couldn't find any active projects for "${searchClient}".`;
                }
            } else {
                response = "Please specify the client name, e.g., 'Find projects for Oikogenesis'.";
            }
        }
        else if (/\b(hello|hi|hey|greetings|howdy)\b/.test(lowerQuery)) {
            response = "Hello! Ask me to check our revenue, count our leads, or search for client projects.";
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
                                placeholder="Ask AI about revenue, leads..."
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
                {!isOpen && <span className="ai-badge">AI</span>}
            </motion.button>
        </motion.div>
    );
};

export default AIChatWidget;
