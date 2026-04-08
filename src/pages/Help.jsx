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
import { BookOpen, Search, FolderArchive, Layers, DollarSign, LayoutDashboard, ListTodo, MessageSquare, Magnet, Edit3 } from 'lucide-react';
import './Help.css';
import { useTranslation } from 'react-i18next';

const Help = () => {
    const { t } = useTranslation();
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
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BookOpen style={{ color: '#06b6d4' }} size={28} /> {t('crm_help_doc', 'CRM Help & Documentation')}</h1>
                <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>{t('crm_help_subtitle', 'Learn how to navigate and utilize the core features of the ArchViz CRM.')}</p>
            </header>

            <div className="help-grid">

                {/* Dashboard & Overview */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-blue"><LayoutDashboard size={24} /></div>
                        <h2 className="help-card-title">{t('dashboard_overview', 'Dashboard Overview')}</h2>
                    </div>
                    <p className="help-description">
                        {t('dashboard_help_desc', 'The Dashboard is your main command center. It provides a real-time snapshot of active projects, pending tasks, and recent activity.')}
                    </p>
                    <ul className="help-list">
                        <li><strong>{t('quick_stats', 'Quick Stats')}:</strong> {t('quick_stats_desc', 'View active projects, pending reviews, and monthly revenue.')}</li>
                        <li><strong>{t('recent_projects', 'Recent Projects')}:</strong> {t('recent_projects_desc', 'Quickly jump into projects you recently interacted with.')}</li>
                        <li><strong>{t('activity_feed', 'Activity Feed')}:</strong> {t('activity_feed_desc', 'See a timeline of the latest CRM events and notifications.')}</li>
                    </ul>
                </section>

                {/* Project Hub / Assets */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-purple"><FolderArchive size={24} /></div>
                        <h2 className="help-card-title">{t('folders_annotator', 'Folders & Image Annotator')}</h2>
                    </div>
                    <p className="help-description">
                        {t('folders_annotator_desc', 'The Project Hub manages all deliverables via smart folders and features our pro-grade Image Annotator.')}
                    </p>
                    <ul className="help-list">
                        <li><strong>{t('standard_folders', 'Standard Folders')}:</strong> {t('standard_folders_desc', 'Click "Create Standard Folders" to instantly generate AI, Client References, and Draft templates.')}</li>
                        <li><strong>{t('annotation_badges', 'Annotation Badges')}:</strong> {t('annotation_badges_desc', 'Folders display a blue💬 badge if there are unresolved comments, and a green✓ badge when all feedback is clear.')}</li>
                        <li><strong>{t('pro_annotator', 'Pro Annotator')}:</strong> {t('pro_annotator_desc', 'Click any image to open the fullscreen Annotator. Draw SVG arrows, drop colored pins, and toggle the Notes panel off to maximize viewing space.')}</li>
                    </ul>
                </section>

                {/* Pipeline & Production */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-magenta"><Layers size={24} /></div>
                        <h2 className="help-card-title">{t('sales_pipeline_production', 'Sales Pipeline & Production')}</h2>
                    </div>
                    <p className="help-description">
                        {t('pipeline_production_desc', 'Manage your active leads and ongoing studio production using our interactive drag-and-drop Kanban boards.')}
                    </p>
                    <ul className="help-list">
                        <li><strong>{t('sales_pipeline', 'Sales Pipeline')}:</strong> {t('sales_pipeline_desc', 'Track potential clients from Initial Contact through Closing. Use the search bar to instantly find leads.')}</li>
                        <li><strong>{t('production_board', 'Production Board')}:</strong> {t('production_board_desc', 'Monitor actual rendering progress. Move projects from 3D Modeling to Rendering to Post-Production. Note the Slack-style comment counters and assigned avatars on each card.')}</li>
                    </ul>
                </section>

                {/* AI Lead Generator */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper" style={{ background: 'rgba(255, 107, 0, 0.15)', color: '#FF6B00' }}><Magnet size={24} /></div>
                        <h2 className="help-card-title">{t('ai_lead_generator', 'AI Lead Generator')}</h2>
                    </div>
                    <p className="help-description">
                        {t('ai_lead_generator_desc', 'Turn the CRM into an outbound sales machine by scanning the web for target Architectural and Development firms.')}
                    </p>
                    <ul className="help-list">
                        <li><strong>{t('region_scanning', 'Region Scanning')}:</strong> {t('region_scanning_desc', 'Select an industry (e.g. Property Developers) and region (e.g. Limassol) to scrape detailed firm profiles.')}</li>
                        <li><strong>{t('pipeline_integration', 'Pipeline Integration')}:</strong> {t('pipeline_integration_desc', 'Click "To Pipeline" to instantly drop a promising lead straight into your Inbox.')}</li>
                        <li><strong>{t('ai_outreach_drafter', 'AI Outreach Drafter')}:</strong> {t('ai_outreach_drafter_desc', 'Click "AI Draft" and our AI will simulate scanning their website to write a personalized outreach email pitching your 3D ArchViz services.')}</li>
                    </ul>
                </section>

                {/* Financials & Invoices */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-emerald"><DollarSign size={24} /></div>
                        <h2 className="help-card-title">{t('financials', 'Financials')}</h2>
                    </div>
                    <p className="help-description">
                        {t('financials_help_desc', 'Track project budgets, deposits, and outstanding balances across all clients.')}
                    </p>
                    <ul className="help-list">
                        <li>{t('balances_color_coded', 'Balances are color-coded:')} <span style={{ color: '#fb7185', fontWeight: 500 }}>{t('red', 'Red')}</span> {t('means_outstanding', 'means outstanding,')} <span style={{ color: '#34d399', fontWeight: 500 }}>{t('green', 'Green')}</span> {t('means_paid_in_full', 'means the project is paid in full.')}</li>
                        <li>{t('record_payment_help', 'Click the Record Payment button next to any project to open the payment modal and log new client transfers or mark items unpaid.')}</li>
                    </ul>
                </section>

                {/* Team Messenger */}
                <section className="help-card glass-panel">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}><MessageSquare size={24} /></div>
                        <h2 className="help-card-title">{t('team_messenger', 'Team Messenger')}</h2>
                    </div>
                    <p className="help-description">
                        {t('team_messenger_desc', 'Communicate instantly with your studio team and administrators using the built-in Slack-style chat interface.')}
                    </p>
                    <ul className="help-list">
                        <li><strong>{t('real_time_chat', 'Real-time Chat')}:</strong> {t('real_time_chat_desc', 'Messages are grouped chronologically by user for easy reading.')}</li>
                        <li><strong>{t('rich_input', 'Rich Input')}:</strong> {t('rich_input_desc', 'Use the rich toolbar to format your messages, add emojis, or attach files.')}</li>
                        <li><strong>{t('avatars', 'Avatars')}:</strong> {t('avatars_desc', 'Visual avatars help quickly distinguish between Admin and standard Employee roles in the chat.')}</li>
                    </ul>
                </section>

                {/* Search & Global Controls */}
                <section className="help-card glass-panel help-card-full">
                    <div className="help-card-header">
                        <div className="help-icon-wrapper icon-white"><Search size={24} /></div>
                        <h2 className="help-card-title">{t('global_controls', 'Global Controls')}</h2>
                    </div>
                    <div className="help-global-grid">
                        <div className="help-global-item">
                            <strong>{t('global_search', 'Global Search')}</strong>
                            {t('global_search_desc', 'Use the search bar in the top navigation at any time to instantly jump to specific clients or projects by name or Reference ID.')}
                        </div>
                        <div className="help-global-item">
                            <strong>{t('theme_toggle', 'Theme Toggle')}</strong>
                            {t('theme_toggle_desc', 'Click the Sun/Moon icon in the top right to switch between Light Mode and our signature dark Glassmorphism UI.')}
                        </div>
                        <div className="help-global-item">
                            <strong>{t('notifications', 'Notifications')}</strong>
                            {t('notifications_desc', 'Click the Bell icon to see recent updates (e.g. "Client Approved Deliverable"). Unread alerts show a red numbered badge.')}
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default Help;
