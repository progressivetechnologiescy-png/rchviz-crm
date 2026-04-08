import React from 'react';
import { motion } from 'framer-motion';
const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
};
import { BookOpen, Search, FolderArchive, Layers, DollarSign, LayoutDashboard, ListTodo, MessageSquare } from 'lucide-react';
import './Help.css';

const Help = () => {
    return (
        <motion.div
            className="help-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header" style={{ display: 'block', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BookOpen style={{ color: '#06b6d4' }} size={28} /> CRM Help & Documentation</h1>
                <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Learn how to navigate and utilize the core features of the ArchViz CRM.</p>
            </header>

            <div className="help-grid">

                {/* Dashboard & Overview */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-blue"><LayoutDashboard size={24} /></div>
                        <h2 className="help-card-title">Dashboard Overview</h2>
                    </div>
                    <p className="help-description">
                        The Dashboard is your main command center. It provides a real-time snapshot of active projects, pending tasks, and recent activity.
                    </p>
                    <ul className="help-list">
                        <li><strong>Quick Stats:</strong> View active projects, pending reviews, and monthly revenue.</li>
                        <li><strong>Recent Projects:</strong> Quickly jump into projects you recently interacted with.</li>
                        <li><strong>Activity Feed:</strong> See a timeline of the latest CRM events and notifications.</li>
                    </ul>
                </section>

                {/* Project Hub / Assets */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-purple"><FolderArchive size={24} /></div>
                        <h2 className="help-card-title">Project Hub & Assets</h2>
                    </div>
                    <p className="help-description">
                        The Project Hub manages all files (JPG, PDF, DWG) and client feedback for every project.
                    </p>
                    <ul className="help-list">
                        <li><strong>File Uploads:</strong> Drag and drop deliverables directly into the Hub to attach them to a project.</li>
                        <li><strong>Lightbox Comments:</strong> Click any image to open the high-resolution lightbox. Use the right sidebar to leave specific comments and annotations for your team.</li>
                    </ul>
                    <div className="help-pro-tip">
                        <p>💡 <strong>Pro Tip:</strong> Use the <strong>Grid vs List</strong> toggle at the top right of the Hub to switch architectures.</p>
                    </div>
                </section>

                {/* Pipeline & Production */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-magenta"><Layers size={24} /></div>
                        <h2 className="help-card-title">Sales Pipeline & Production</h2>
                    </div>
                    <p className="help-description">
                        Manage your active leads and ongoing studio production using our interactive drag-and-drop Kanban boards.
                    </p>
                    <ul className="help-list">
                        <li><strong>Sales Pipeline:</strong> Track potential clients from Initial Contact through Closing. Use the search bar to instantly find leads.</li>
                        <li><strong>Production Board:</strong> Monitor actual rendering progress. Move projects from 3D Modeling to Rendering to Post-Production. Note the Slack-style comment counters and assigned avatars on each card.</li>
                    </ul>
                </section>

                {/* Financials & Invoices */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-emerald"><DollarSign size={24} /></div>
                        <h2 className="help-card-title">Financials</h2>
                    </div>
                    <p className="help-description">
                        Track project budgets, deposits, and outstanding balances across all clients.
                    </p>
                    <ul className="help-list">
                        <li>Balances are color-coded: <span style={{ color: '#fb7185', fontWeight: 500 }}>Red</span> means outstanding, <span style={{ color: '#34d399', fontWeight: 500 }}>Green</span> means the project is paid in full.</li>
                        <li>Click the <strong>Record Payment</strong> button next to any project to open the payment modal and log new client transfers or mark items unpaid.</li>
                    </ul>
                </section>

                {/* Team Messenger */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}><MessageSquare size={24} /></div>
                        <h2 className="help-card-title">Team Messenger</h2>
                    </div>
                    <p className="help-description">
                        Communicate instantly with your studio team and administrators using the built-in Slack-style chat interface.
                    </p>
                    <ul className="help-list">
                        <li><strong>Real-time Chat:</strong> Messages are grouped chronologically by user for easy reading.</li>
                        <li><strong>Rich Input:</strong> Use the rich toolbar to format your messages, add emojis, or attach files.</li>
                        <li><strong>Avatars:</strong> Visual avatars help quickly distinguish between Admin and standard Employee roles in the chat.</li>
                    </ul>
                </section>

                {/* Search & Global Controls */}
                <section className="help-card glass-panel help-card-full">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-white"><Search size={24} /></div>
                        <h2 className="help-card-title">Global Controls</h2>
                    </div>
                    <div className="help-global-grid">
                        <div className="help-global-item">
                            <strong>Global Search</strong>
                            Use the search bar in the top navigation at any time to instantly jump to specific clients or projects by name or Reference ID.
                        </div>
                        <div className="help-global-item">
                            <strong>Theme Toggle</strong>
                            Click the Sun/Moon icon in the top right to switch between Light Mode and our signature dark Glassmorphism UI.
                        </div>
                        <div className="help-global-item">
                            <strong>Notifications</strong>
                            Click the Bell icon to see recent updates (e.g. "Client Approved Deliverable"). Unread alerts show a red numbered badge.
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default Help;
