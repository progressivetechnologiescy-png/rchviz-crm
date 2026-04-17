import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Building2, MapPin, MousePointer2, Plus, Mail, CheckCircle2, Phone, EyeOff, MoreVertical, Eye, RefreshCw, X, ArrowUpRight, Copy } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

const toGreekCaps = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const LeadGenerator = () => {
    const { t } = useTranslation();
    const { addLead, addClient, bannedLeads, banLead, unbanLead, addPipelineLead, sentLeads, addSentLead, removeSentLead } = useStore();
    const [isScanning, setIsScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [industry, setIndustry] = useState('Architects');
    const [location, setLocation] = useState('Limassol, Cyprus');
    const [limit, setLimit] = useState('10');
    const [leads, setLeads] = useState([]);
    const [searchMode, setSearchMode] = useState('organic');
    const [copiedContent, setCopiedContent] = useState(false);

    // UI State for composer
    const [composingLead, setComposingLead] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Email Integration State
    const [isSending, setIsSending] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);

    // Hidden Leads Modal State
    const [showHiddenLeadsModal, setShowHiddenLeadsModal] = useState(false);

    // Sent Leads Modal State
    const [showSentLeadsModal, setShowSentLeadsModal] = useState(false);

    const handleSendEmail = async () => {
        // Per user request, Reddit Radar ignores frontend industry/location selectors.
        // It always executes a massive, universal global query targeting all potential clients.
        let searchQuery = `(3D OR ArchViz OR "3D rendering" OR Architect) (hiring OR "looking for")`;
        
        console.log(`[!] Executing Universal Reddit JSON Query for: ${searchQuery}`);
        setIsSending(true);
        setEmailSuccess(false);

        const industryText = composingLead.industry === 'Architects' ? 'design and material selection' :
            composingLead.industry === 'Real Estate Agencies' ? 'property listings and client presentations' :
                composingLead.industry === 'Property Developers' ? 'developments and portfolio expansion' :
                    composingLead.industry === 'Interior Designers' ? 'interior styling and space planning' :
                        'innovative developments';

        const helpText = composingLead.industry === 'Architects' ? 'architects win more competitions and communicate their vision clearly' :
            composingLead.industry === 'Real Estate Agencies' ? 'real estate agencies secure more exclusive listings with stunning visuals' :
                composingLead.industry === 'Property Developers' ? 'property developers sell off-plan faster and attract premium investors' :
                    composingLead.industry === 'Interior Designers' ? 'interior designers showcase their concepts and secure client approvals' :
                        'firms elevate their marketing and secure more clients';

        const htmlBody = `
            <p>Hi there team at ${composingLead.company},</p>
            <p>I was really impressed by your recent work featured on ${composingLead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}. Especially your focus on premium ${industryText}.</p>
            <p>At Progressive Technologies, we specialize in high-end 3D architectural visualization. We help ${helpText}.</p>
            <p>I'd love to show you how a few of our visualizations could impact your next major project. <br/><br/>
            <b>📅 Choose a date / book a call:</b> <a href="https://calendar.google.com/calendar/r/eventedit?text=ArchViz+Consultation+with+Progressive+Technologies" style="color: #0055ff; font-weight: bold; text-decoration: underline;">Schedule via Google Calendar</a></p>
            <br/>
            <p>Best regards,<br/>
            <b>Progressive ArchViz Team</b><br/>
            <a href="https://progressivetechnologies.com.cy/" style="color: #666; text-decoration: none;">progressivetechnologies.com.cy</a><br/>
            <span style="color: #666;">Phone: +357 25 878312</span><br/><br/>
            <a href="https://www.facebook.com/ProgressiveTechnologies" style="color: #0078d4; text-decoration: none;">Facebook</a> | <a href="https://www.instagram.com/progressive_technologies/" style="color: #e1306c; text-decoration: none;">Instagram</a>
            </p>
        `;

        try {
            const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const API_BASE = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001' : 'https://rchviz-crm.onrender.com');
            const response = await fetch(`${API_BASE}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: composingLead.email || 'contact@' + composingLead.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
                    subject: 'Elevating your upcoming projects with photorealistic 3D rendering',
                    body: htmlBody
                })
            });

            if (response.ok) {
                setEmailSuccess(true);
                addSentLead(composingLead.website);
                // Remove from the current leads list without adding to CRM
                setLeads(prev => prev.filter(l => l.id !== composingLead.id));
                setTimeout(() => {
                    setComposingLead(null);
                    setEmailSuccess(false);
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    const handleScan = async () => {
        setIsScanning(true);
        setHasScanned(false);
        setLeads([]);
        const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const API_BASE = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001' : 'https://rchviz-crm.onrender.com');
        const endpoint = searchMode === 'x-radar' ? `${API_BASE}/api/scrape-x` : `${API_BASE}/api/scrape`;
        const payload = { industry, location, limit: parseInt(limit, 10), banned: [...bannedLeads, ...sentLeads] };

        // Fetch from the real Puppeteer Scraper API
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to connect to AI Scraper Backend');
            }

            if (data.success) {
                // Determine the correct array key based on the endpoint response structure
                const scrapedData = data.leads || [];
                
                // Initialize custom frontend flags on incoming scraped data
                const processedLeads = scrapedData.map(lead => ({
                    ...lead,
                    added: false
                }));
                setLeads(processedLeads);
                setHasScanned(true);
            } else {
                console.error("Scraper returned an error:", data.error);
                alert("Scraping failed: " + data.error);
            }
        } catch (error) {
            console.error("Error communicating with crawler:", error);
            alert("Could not connect to the Backend Scraper. Please ensure Render server is active. Error: " + error.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddToPipeline = (lead) => {
        const newTask = {
            title: `Outreach: ${lead.company}`,
            client: lead.company,
            priority: 'Medium',
            assignee: 'Unassigned',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString() // 3 days from now
        };
        addLead(newTask);

        setLeads(prev => prev.map(l =>
            l.id === lead.id ? { ...l, added: true } : l
        ));
    };

    const handleAddAsClient = (lead) => {
        const newClient = {
            id: `client-${Date.now()}`,
            name: lead.company,
            contact: 'Unknown',
            email: lead.email || `contact@${lead.website.replace(/^https?:\/\//, '').split('/')[0]}`,
            phone: lead.phone || 'Unknown',
            activeProjects: [],
            totalValue: '€0'
        };
        addClient(newClient);
        banLead(lead.website);

        setLeads(prev => prev.filter(l => l.id !== lead.id));
    };

    const handleHideLead = (lead) => {
        banLead(lead.website);
        setLeads(prev => prev.filter(l => l.id !== lead.id));
    };

    const handleDraftOutreach = (lead) => {
        setComposingLead(lead);
        setIsAnalyzing(true);

        // Simulate AI analyzing the website and writing copy
        setTimeout(() => {
            setIsAnalyzing(false);
        }, 2000);
    };

    const [hiddenLeadsSearchTerm, setHiddenLeadsSearchTerm] = useState('');

    const filteredBannedLeads = bannedLeads.filter(url =>
        url.toLowerCase().includes(hiddenLeadsSearchTerm.toLowerCase())
    );

    const [sentLeadsSearchTerm, setSentLeadsSearchTerm] = useState('');

    const filteredSentLeads = sentLeads.filter(url =>
        url.toLowerCase().includes(sentLeadsSearchTerm.toLowerCase())
    );

    return (
        <motion.div
            className="p-6 md:p-8 max-w-[1400px] mx-auto w-full min-h-full flex flex-col relative pb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <header className="page-header mb-8">
                <div>
                    <h1 className="page-title">{t('lead_generator', 'Lead Generator')}</h1>
                    <p className="page-subtitle">{t('discover_outreach_leads', 'Discover and outreach to new architecture and development clients.')}</p>
                </div>
            </header>

            <div className="w-full flex flex-col gap-6 relative">

                {/* Mode Tabs */}
                <div className="flex gap-4 mb-2 border-b border-[var(--glass-border)] pb-0">
                    <button
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${searchMode === 'organic' ? 'text-accent-cyan' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        onClick={() => { setSearchMode('organic'); setHasScanned(false); setLeads([]); }}
                    >
                        <div className="flex items-center gap-2"><Search size={16}/> {t('organic_leads', 'Organic Web Leads')}</div>
                        {searchMode === 'organic' && <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan" />}
                    </button>
                    <button
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${searchMode === 'x-radar' ? 'text-orange-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        onClick={() => { setSearchMode('x-radar'); setHasScanned(false); setLeads([]); }}
                    >
                        <div className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.191.46c1.2-.833 2.836-1.385 4.63-1.472l.836-3.882a.238.238 0 0 1 .282-.18l3.19.673zM8.706 13.918c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm6.619 0c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm-3.32 4.148c-1.378 0-2.617-.384-2.883-.509-.164-.078-.236-.27-.16-.432.078-.163.268-.235.433-.16.142.067 1.258.4 2.61.4 1.344 0 2.45-.333 2.592-.398.163-.075.355-.008.43.155.075.163.007.355-.156.43-.263.123-1.498.514-2.866.514z"></path></svg>
                            {t('x_radar', 'Reddit Radar')}
                        </div>
                        {searchMode === 'x-radar' && <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                    </button>
                </div>

                {/* Search Controls (Dynamic based on tab) */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                    {searchMode === 'organic' && (
                        <>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{toGreekCaps(t('target_industry', 'Target Industry'))}</label>
                                <select
                                    className="input-field w-full h-11"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                >
                                    <option value="All">{t('all_real_estate', 'All Real Estate')}</option>
                                    <option value="Architects">{t('architects', 'Architects')}</option>
                                    <option value="Property Developers">{t('property_developers', 'Property Developers')}</option>
                                    <option value="Architectural Jobs">{t('architectural_jobs', 'Architectural Jobs')}</option>
                                    <option value="3D/ArchViz Jobs">{t('3d_archviz_jobs', '3D / ArchViz Jobs')}</option>
                                    <option value="Interior Designers">{t('interior_designers', 'Interior Designers')}</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{toGreekCaps(t('target_region', 'Target Region'))}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                    <input
                                        type="text"
                                        className="input-field w-full h-11"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={t('target_region_placeholder', 'e.g. Limassol, Cyprus')}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    <div className={`${searchMode === 'x-radar' ? 'w-full md:w-64 mx-auto md:mx-0' : 'w-[100px] shrink-0'}`}>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{toGreekCaps(t('limit', 'Limit'))}</label>
                            <select
                                className="input-field w-full h-11 px-2"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        className="btn border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] h-11 px-6 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg transition-all"
                        onClick={() => setShowHiddenLeadsModal(true)}
                    >
                        <EyeOff size={18} className="text-[var(--text-secondary)]" />
                        <span className="hidden sm:inline">{t('hidden_leads', 'Hidden Leads')}</span>
                        {bannedLeads.length > 0 && (
                            <span className="bg-[var(--bg-tertiary)] border border-[var(--text-secondary)] text-[var(--accent-primary)] text-xs font-bold rounded-full px-2 py-0.5 ml-1">{bannedLeads.length}</span>
                        )}
                    </button>
                    <button
                        className="btn border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] h-11 px-6 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg transition-all"
                        onClick={() => setShowSentLeadsModal(true)}
                    >
                        <Mail size={18} className="text-[var(--text-secondary)]" />
                        <span className="hidden sm:inline">{t('sent_leads', 'Sent Leads')}</span>
                        {sentLeads.length > 0 && (
                            <span className="bg-[var(--bg-tertiary)] border border-[var(--text-secondary)] text-[var(--accent-primary)] text-xs font-bold rounded-full px-2 py-0.5 ml-1">{sentLeads.length}</span>
                        )}
                    </button>
                    <button
                        className="btn btn-primary h-11 px-8 min-w-[160px] flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg shadow-cyan-500/20"
                        onClick={handleScan}
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>{t('scanning_web', 'Scanning...')}</span>
                                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                <span>{searchMode === 'organic' ? t('find_leads', 'Find Leads') : `Scan Reddit for ${limit} Posts`}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Results Area */}
            <>
                {!hasScanned && !isScanning ? (
                    searchMode === 'organic' ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center mb-4 text-[var(--text-secondary)] shadow-inner">
                                <Search size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t('ready_find_clients', 'Ready to find new clients?')}</h3>
                            <p className="text-[var(--text-secondary)] max-w-md">{t('configure_search', 'Configure your search targets above to automatically scrape web directories and databases for highly relevant ArchViz leads.')}</p>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-4 shadow-inner">
                                <svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.191.46c1.2-.833 2.836-1.385 4.63-1.472l.836-3.882a.238.238 0 0 1 .282-.18l3.19.673zM8.706 13.918c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm6.619 0c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm-3.32 4.148c-1.378 0-2.617-.384-2.883-.509-.164-.078-.236-.27-.16-.432.078-.163.268-.235.433-.16.142.067 1.258.4 2.61.4 1.344 0 2.45-.333 2.592-.398.163-.075.355-.008.43.155.075.163.007.355-.156.43-.263.123-1.498.514-2.866.514z"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Ready to scan Reddit for live leads?</h3>
                            <p className="text-[var(--text-secondary)] max-w-md">Click the scan button above to automatically query Reddit's 3D/ArchViz JSON streams and fetch {limit} live opportunities.</p>
                        </div>
                    )
                ) : null}

            {isScanning && (
                <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-t-2 border-accent-blue rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin reverse-spin delay-150"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search size={24} className="text-accent-blue animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-accent-cyan animate-pulse">
                        {searchMode === 'organic' ? t('scanning_registries', 'Searching Google and business directories...') : 'Querying active Reddit JSON hiring feeds...'}
                    </h3>
                    <p className="text-[var(--text-secondary)] mt-2 text-sm italic">{t('searching_for', "Searching for '{{industry}}' in '{{location}}'", { industry, location })}</p>
                </div>
            )}

            {hasScanned && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-2xl overflow-hidden mt-6"
                >
                    <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                        <h3 className="section-title flex items-center gap-2">
                            <Building2 size={18} className="text-accent-blue" />
                            {t('discovered_leads', 'Discovered {{count}} high-intent leads', { count: leads.length })}
                        </h3>
                    </div>

                    {searchMode === 'organic' && (
                    <div className="table-container pt-2 pb-4">
                        <table className="clients-table w-full table-fixed">
                            <thead>
                                <tr>
                                    <th className="w-[30%]">{t('company', 'Company')}</th>
                                    <th className="w-[20%]">{t('website', 'Website')}</th>
                                    <th className="w-[20%] hidden sm:table-cell">{t('contact_info', 'Contact')}</th>
                                    <th className="w-[30%] text-right">{t('actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={lead.id}
                                        className="table-row hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="overflow-hidden max-w-0">
                                            <div className="client-brand-group">
                                                <div className="client-avatar shrink-0 group-hover:bg-primary/20 transition-colors">
                                                    <Building2 size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-sm font-semibold text-[var(--text-primary)] block truncate" title={lead.company}>{lead.company}</span>
                                                    <span className="text-xs text-[var(--text-secondary)] truncate block" title={lead.industry}>{lead.industry}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="overflow-hidden max-w-0">
                                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="text-sm text-accent-cyan font-medium hover:underline flex items-center gap-1 w-full" title={lead.website}>
                                                <span className="truncate block">{lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                            </a>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1 w-full cursor-default" title={lead.location}>
                                                <span className="truncate block">{lead.location}</span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell overflow-hidden max-w-0 pr-4">
                                            <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 w-full cursor-default" title={lead.email}>
                                                <Mail size={14} className="text-[var(--text-tertiary)] shrink-0" />
                                                <span className="truncate block">{lead.email}</span>
                                            </div>
                                            <div className="mt-1 text-sm text-[var(--text-secondary)] flex items-center gap-2 w-full cursor-default" title={lead.phone}>
                                                <Phone size={14} className="text-[var(--text-tertiary)] shrink-0" />
                                                <span className="truncate block">{lead.phone}</span>
                                            </div>
                                        </td>
                                        <td className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="btn btn-secondary text-xs py-1.5 px-3 whitespace-nowrap flex items-center"
                                                    onClick={() => handleDraftOutreach(lead)}
                                                >
                                                    <Mail size={14} className="mr-1" />
                                                    {t('ai_draft', 'AI Draft')}
                                                </button>
                                                <button
                                                    className={`btn text-xs py-1.5 px-3 min-w-[110px] whitespace-nowrap flex items-center justify-center gap-1 ${lead.added ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'btn-primary'}`}
                                                    onClick={() => handleAddToPipeline(lead)}
                                                    disabled={lead.added}
                                                >
                                                    {lead.added ? (
                                                        <><CheckCircle2 size={14} /> {t('added', 'Added')}</>
                                                    ) : (
                                                        <><Plus size={14} /> {t('to_pipeline', 'To Pipeline')}</>
                                                    )}
                                                </button>
                                                <div className="w-px h-6 bg-[var(--glass-border)] mx-1"></div>
                                                <button
                                                    className="btn-icon bg-emerald-500/10 border border-emerald-500/30 !text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors shadow-sm"
                                                    title={t('add_client_directory', 'Add Lead to Clients Directory')}
                                                    onClick={() => handleAddAsClient(lead)}
                                                >
                                                    <Building2 size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    className="btn-icon bg-red-500/10 border border-red-500/30 !text-red-500 hover:bg-red-500/20 hover:border-red-500/50 transition-colors shadow-sm"
                                                    title={t('remove_hide_lead', 'Remove & hide from future searches')}
                                                    onClick={() => handleHideLead(lead)}
                                                >
                                                    <EyeOff size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </motion.div>
            )}

            {searchMode === 'x-radar' && hasScanned && leads.length > 0 && (
                <div className="mt-6 flex flex-col gap-6 w-full pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leads.map((lead, idx) => {
                            const dmText = `Hey ${lead.handle.split('@')[0]},\n\nSaw your post looking for 3D work.\n\nI run an architectural visualization studio based out of Cyprus but we execute global projects. We specialize in high-end photorealism to help secure pre-sales and offer highly competitive pricing without compromising on quality.\n\nCheck out our recent portfolio:\nWebsite: https://www.progressivetechnologies.com.cy/\nInstagram: https://www.instagram.com/progressive_technologies/\n\nMind if I send over a few more examples of our work?`;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                                    key={lead.id}
                                    className="glass-panel rounded-3xl p-6 flex flex-col h-full border-t border-l border-white/10 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>

                                    {/* Header: User Handle & Link */}
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.191.46c1.2-.833 2.836-1.385 4.63-1.472l.836-3.882a.238.238 0 0 1 .282-.18l3.19.673zM8.706 13.918c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm6.619 0c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm-3.32 4.148c-1.378 0-2.617-.384-2.883-.509-.164-.078-.236-.27-.16-.432.078-.163.268-.235.433-.16.142.067 1.258.4 2.61.4 1.344 0 2.45-.333 2.592-.398.163-.075.355-.008.43.155.075.163.007.355-.156.43-.263.123-1.498.514-2.866.514z"></path></svg>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-[var(--text-primary)] block tracking-tight">{lead.handle}</span>
                                                <span className="text-[10px] text-[var(--text-tertiary)] uppercase flex items-center gap-1 font-semibold tracking-wider">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${lead.timeAgo.includes('m') ? 'bg-emerald-400 animate-pulse' : 'bg-orange-500'}`}></span> 
                                                    {lead.timeAgo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body: Tweet Content */}
                                    <div className="mb-6 flex-1 relative z-10">
                                        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] font-medium">
                                            "{lead.content}"
                                        </p>
                                    </div>

                                    {/* Action Area: Pre-written DM */}
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-4 relative z-10 group/dm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} /> AI Suggested DM</span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-3 italic mb-3">
                                            {dmText}
                                        </p>
                                        
                                        <div className="flex gap-2 w-full mt-auto">
                                            <a
                                                href={lead.tweetUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn flex-1 h-9 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                Open Live Post <ArrowUpRight size={14} />
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    navigator.clipboard.writeText(dmText);
                                                    const btn = e.currentTarget;
                                                    const originalContent = btn.innerHTML;
                                                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" class="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                                                    btn.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
                                                    setTimeout(() => {
                                                        btn.innerHTML = originalContent;
                                                        btn.classList.remove('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
                                                    }, 2000);
                                                }}
                                                className="btn h-9 px-4 rounded-xl text-xs font-semibold bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Copy size={14} /> Copy DM
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
            </>

            {/* AI Composer Side Panel */}
            <AnimatePresence>
                {composingLead && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-10"
                            onClick={() => setComposingLead(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 400 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 400 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-[450px] bg-[var(--bg-primary)] border-l border-[var(--glass-border)] shadow-2xl z-20 flex flex-col fixed right-0 top-0 bottom-0"
                        >
                            <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between sticky top-0 bg-[var(--bg-secondary)] backdrop-blur-md z-10 shrink-0 gap-4">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">{t('ai_outreach_composer', 'AI Outreach Composer')}</h2>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{t('drafting_to', 'Drafting to')} {composingLead.company}</p>
                                </div>
                                <button
                                    onClick={() => setComposingLead(null)}
                                    className="p-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-border)] rounded-full transition-colors shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                        <Loader2 className="animate-spin text-accent-blue" size={32} />
                                        <div className="text-sm text-center">
                                            <p className="text-[var(--text-primary)] font-medium">{t('analyzing_prospect', 'Analyzing prospect...')}</p>
                                            <p className="text-[var(--text-secondary)] text-xs mt-1">{t('scanning', 'Scanning')} {composingLead.website} {t('for_recent_projects', 'for recent projects and architectural style...')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <div className="glass-panel p-5 pb-14 rounded-2xl text-[13px] text-[var(--text-secondary)] shadow-lg">
                                                <div className="font-mono text-[11px] font-medium text-accent-cyan mb-4 flex items-center gap-2 tracking-wider uppercase">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></div>
                                                    AI {searchMode === 'x-radar' ? 'Reply' : 'context'} generated successfully
                                                </div>
                                                
                                                {searchMode === 'x-radar' ? (
                                                    <div className="space-y-4 leading-relaxed text-[var(--text-primary)]">
                                                        <p>Hey {composingLead.handle.replace('@', '')}, saw your recent post looking for 3D help.</p>
                                                        <p>I run an architectural visualization studio based out of Cyprus. We specialize in exactly this kind of high-end photorealism to help secure pre-sales and investor pitches.</p>
                                                        <p>Would love to show you a few relevant exterior concepts we just wrapped up. Mind if I message you our portfolio?</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 leading-relaxed text-[var(--text-primary)]">
                                                        <p><span className="text-[var(--text-secondary)]">Subject:</span> Elevating your upcoming projects with photorealistic 3D rendering</p>
                                                        <p>Hi there team at {composingLead.company},</p>
                                                        <p>
                                                            I was really impressed by your recent work featured on {composingLead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}. Especially your focus on premium {
                                                                composingLead.industry === 'Architects' ? 'design and material selection' :
                                                                    composingLead.industry === 'Real Estate Agencies' ? 'property listings and client presentations' :
                                                                        composingLead.industry === 'Property Developers' ? 'developments and portfolio expansion' :
                                                                            composingLead.industry === 'Interior Designers' ? 'interior styling and space planning' :
                                                                                'innovative developments'
                                                            }.
                                                        </p>
                                                        <p>
                                                            At Progressive Technologies, we specialize in high-end 3D architectural visualization. We help {
                                                                composingLead.industry === 'Architects' ? 'architects win more competitions and communicate their vision clearly' :
                                                                    composingLead.industry === 'Real Estate Agencies' ? 'real estate agencies secure more exclusive listings with stunning visuals' :
                                                                        composingLead.industry === 'Property Developers' ? 'property developers sell off-plan faster and attract premium investors' :
                                                                            composingLead.industry === 'Interior Designers' ? 'interior designers showcase their concepts and secure client approvals' :
                                                                                'firms elevate their marketing and secure more clients'
                                                            }.
                                                        </p>
                                                        <p>I'd love to show you how a few of our visualizations could impact your next major project. <br /><br />
                                                            <b>📅 Choose a date / book a call:</b> <a href="https://calendar.google.com/calendar/r/eventedit?text=ArchViz+Consultation+with+Progressive+Technologies" target="_blank" rel="noreferrer" className="text-accent-blue font-semibold hover:underline">Schedule via Google Calendar</a>
                                                        </p>
                                                        <br />
                                                        <p>
                                                            Best regards,<br />
                                                            <span className="font-semibold text-[var(--text-primary)]">Progressive ArchViz Team</span><br />
                                                            <span className="text-[var(--text-secondary)]">Phone: +357 25 878312</span><br />
                                                            <span className="text-xs mt-3 flex items-center gap-2 text-[var(--text-secondary)]">
                                                                <a href="https://progressivetechnologies.com.cy/" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)] hover:underline">progressivetechnologies.com.cy</a>
                                                                <span className="text-[var(--glass-border)]">|</span>
                                                                <a href="https://www.facebook.com/ProgressiveTechnologies" target="_blank" rel="noreferrer" className="text-[#0078d4] hover:underline">Facebook</a>
                                                                <span className="text-[var(--glass-border)]">|</span>
                                                                <a href="https://www.instagram.com/progressive_technologies/" target="_blank" rel="noreferrer" className="text-[#e1306c] hover:underline">Instagram</a>
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                                <button className="absolute bottom-4 right-4 btn btn-secondary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {t('copy_text', 'Copy Text')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">{toGreekCaps(t('send_options', 'Actions'))}</h4>

                                            {searchMode === 'organic' ? (
                                                <button
                                                    className={`btn w-full justify-start py-3 border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all ${emailSuccess ? 'bg-emerald-500/10 border-emerald-500/30' : 'hover:bg-[#ea4335]/5 hover:border-[#ea4335]/30'}`}
                                                    onClick={handleSendEmail}
                                                    disabled={isSending || emailSuccess}
                                                >
                                                    {emailSuccess ? (
                                                        <><CheckCircle2 size={16} className="mr-3 text-emerald-500" /> {t('sent_successfully', 'Sent Successfully')}</>
                                                    ) : isSending ? (
                                                        <><Loader2 size={16} className="mr-3 text-[#ea4335] animate-spin" /> {t('sending', 'Sending...')}</>
                                                    ) : (
                                                        <><Mail size={16} className="mr-3 text-[#ea4335]" /> {t('send_via_gmail', 'Send via Gmail')}</>
                                                    )}
                                                </button>
                                            ) : (
                                                <button className="btn w-full justify-start py-3 shadow-none bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20" onClick={() => {
                                                    navigator.clipboard.writeText(`Hey ${composingLead.handle.replace('@', '')}, saw your post looking for 3D work.\n\nI run an architectural visualization studio based out of Cyprus. We specialize in exactly this kind of high-end photorealism to help secure pre-sales and investor pitches.\n\nWould love to show you a few relevant exterior concepts we just wrapped up. Mind if I message you our portfolio?`);
                                                    window.open(composingLead.tweetUrl, '_blank');
                                                }}>
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor" className="mr-3"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.191.46c1.2-.833 2.836-1.385 4.63-1.472l.836-3.882a.238.238 0 0 1 .282-.18l3.19.673zM8.706 13.918c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm6.619 0c-.808 0-1.464.656-1.464 1.464 0 .808.656 1.464 1.464 1.464.808 0 1.464-.656 1.464-1.464 0-.808-.656-1.464-1.464-1.464zm-3.32 4.148c-1.378 0-2.617-.384-2.883-.509-.164-.078-.236-.27-.16-.432.078-.163.268-.235.433-.16.142.067 1.258.4 2.61.4 1.344 0 2.45-.333 2.592-.398.163-.075.355-.008.43.155.075.163.007.355-.156.43-.263.123-1.498.514-2.866.514z"></path></svg> 
                                                    Copy Reply & Open Reddit
                                                </button>
                                            )}

                                            <button className="btn w-full justify-start py-3 shadow-none bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" onClick={() => handleAddToPipeline(composingLead)}>
                                                <CheckCircle2 size={16} className="mr-3" /> {t('save_to_pipeline_copy', 'Save to Pipeline')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hidden Leads Modal */}
            <AnimatePresence>
                {showHiddenLeadsModal && (
                    <div className="modal-overlay" onClick={() => setShowHiddenLeadsModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-card glass-panel flex flex-col max-h-[80vh] w-full max-w-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <EyeOff size={20} className="text-[var(--text-secondary)]" />
                                    Hidden Leads
                                </h2>
                                <button onClick={() => setShowHiddenLeadsModal(false)} className="btn-icon">
                                    <X size={20} />
                                </button>
                            </div>
                            {bannedLeads.length > 0 && (
                                <div className="px-6 pt-6 pb-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                                        <input
                                            type="text"
                                            placeholder={t('search_hidden_leads', 'Search hidden leads...')}
                                            className="input-field w-full h-10 text-sm"
                                            style={{ paddingLeft: '2.25rem' }}
                                            value={hiddenLeadsSearchTerm}
                                            onChange={(e) => setHiddenLeadsSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-6 overflow-y-auto w-full">
                                {filteredBannedLeads.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--text-secondary)]">
                                        <Eye size={32} className="mx-auto mb-3 opacity-20" />
                                        <p>{hiddenLeadsSearchTerm ? t('no_leads_match_search', "No leads match your search.") : t('no_hidden_leads', "No hidden leads.")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredBannedLeads.map((url, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                                                <span className="text-sm truncate mr-4 text-[var(--text-secondary)]">{url}</span>
                                                <button
                                                    onClick={() => {
                                                        unbanLead(url);
                                                        if (filteredBannedLeads.length === 1) setHiddenLeadsSearchTerm('');
                                                    }}
                                                    className="btn btn-secondary text-xs px-3 py-1.5 whitespace-nowrap hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors"
                                                >
                                                    <RefreshCw size={12} className="mr-1.5" /> {t('restore', 'Restore')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sent Leads Modal */}
            <AnimatePresence>
                {showSentLeadsModal && (
                    <div className="modal-overlay" onClick={() => setShowSentLeadsModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-card glass-panel flex flex-col max-h-[80vh] w-full max-w-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Mail size={20} className="text-[var(--text-secondary)]" />
                                    Sent Leads
                                </h2>
                                <button onClick={() => setShowSentLeadsModal(false)} className="btn-icon">
                                    <X size={20} />
                                </button>
                            </div>
                            {sentLeads.length > 0 && (
                                <div className="px-6 pt-6 pb-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                                        <input
                                            type="text"
                                            placeholder={t('search_sent_leads', 'Search sent leads...')}
                                            className="input-field w-full h-10 text-sm"
                                            style={{ paddingLeft: '2.25rem' }}
                                            value={sentLeadsSearchTerm}
                                            onChange={(e) => setSentLeadsSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-6 overflow-y-auto w-full">
                                {filteredSentLeads.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--text-secondary)]">
                                        <Mail size={32} className="mx-auto mb-3 opacity-20" />
                                        <p>{sentLeadsSearchTerm ? t('no_leads_match_search', "No leads match your search.") : t('no_sent_leads', "No sent leads.")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredSentLeads.map((url, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                                                <span className="text-sm truncate mr-4 text-[var(--text-secondary)]">{url}</span>
                                                <button
                                                    onClick={() => {
                                                        removeSentLead(url);
                                                        if (filteredSentLeads.length === 1) setSentLeadsSearchTerm('');
                                                    }}
                                                    className="btn btn-secondary text-xs px-3 py-1.5 whitespace-nowrap hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
                                                >
                                                    <X size={12} className="mr-1.5" /> {t('remove', 'Remove')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

// Helper for location text formatting
const composingLocation = (loc) => {
    return loc ? loc.split(',')[0] : 'Cyprus';
};

export default LeadGenerator;
