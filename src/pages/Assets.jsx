import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './Assets.css';
import { MessageSquare, ArrowLeft, Send, FolderArchive, FileArchive, Download, Upload, X, Eye, Grid, List, FileText, PenTool, Image as ImageIcon, Search } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300 } }
};

const projectImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400'
];

const ProjectManagement = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const projects = useStore(state => state.projects);
    const assets = useStore(state => state.assets);
    const folders = useStore(state => state.folders);
    const addAsset = useStore(state => state.addAsset);
    const addFolder = useStore(state => state.addFolder);
    const addAssetComment = useStore(state => state.addAssetComment);

    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [hubViewMode, setHubViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Clear active project views if the user forces a router-level navigation to the base route (e.g. via Sidebar Project Hub link)
    useEffect(() => {
        if (location.pathname === '/assets') {
            setSelectedProject(null);
            setSelectedFolder(null);
            setSelectedImage(null);
            setIsCreatingFolder(false);
            setNewFolderName('');
        }
    }, [location.key, location.pathname]);

    // Auto-select project if ID is provided in the URL
    useEffect(() => {
        if (id && projects.length > 0) {
            const proj = projects.find(p => p.id === id);
            if (proj) {
                setSelectedProject(proj);
            }
        }
    }, [id, projects]);
    const [newComment, setNewComment] = useState('');
    const [annotations, setAnnotations] = useState([
        { id: 1, x: 40, y: 30, text: 'Adjust lighting temperature to be warmer (3200K) to match the evening mood board.', title: 'Lighting', time: '1h ago' },
        { id: 2, x: 65, y: 55, text: 'Change floor material to matte black marble, current reflection is too high.', title: 'Materials', time: '2h ago' }
    ]);
    const [newImageComment, setNewImageComment] = useState('');
    const [comments, setComments] = useState([
        { id: 1, author: 'Studio Admin', text: 'Please review the latest lighting passes inside the deliverables folder.', time: '2h ago' },
        { id: 2, author: 'Client', text: 'Looks great! Can we adjust the landscaping in the foreground?', time: '1h ago' }
    ]);

    const handleSendComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setComments([...comments, { id: Date.now(), author: 'You', text: newComment, time: 'Just now' }]);
        setNewComment('');
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const file = e.target.files[0];
            const extension = file.name.split('.').pop().toLowerCase();
            let type = 'Other';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) type = 'Render';
            if (extension === 'pdf') type = 'Document';
            if (['dwg', 'dxf', 'cad', 'max'].includes(extension)) type = 'CAD Model';
            if (['zip', 'rar', '7z'].includes(extension)) type = 'Archive';

            // Generate an instant object URL for image preview if it's an image
            const fileUrl = type === 'Render' ? URL.createObjectURL(file) : null;
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

            // Mock upload delay
            setTimeout(() => {
                const newAsset = {
                    name: file.name,
                    projectId: selectedProject.id,
                    folderId: selectedFolder ? selectedFolder.id : null,
                    type: type,
                    size: sizeInMB >= 1000 ? `${(sizeInMB / 1024).toFixed(1)} GB` : `${sizeInMB} MB`,
                    modified: 'Just now',
                    image: fileUrl || '',
                    comments: []
                };
                addAsset(newAsset);
                setIsUploading(false);
            }, 800);
        }
    };

    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (!newFolderName.trim() || !selectedProject) return;
        addFolder({ projectId: selectedProject.id, name: newFolderName });
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    const projectAssets = selectedProject ? assets.filter(a => a.projectId === selectedProject.id && (selectedFolder ? a.folderId === selectedFolder.id : true)) : [];
    const projectFolders = selectedProject ? folders.filter(f => f.projectId === selectedProject.id) : [];

    return (
        <motion.div
            className="assets-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <AnimatePresence mode="wait">
                {!selectedProject ? (
                    <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="full-width">
                        <header className="page-header flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="page-title">{t('project_hub', 'Project Hub')}</h1>
                                <p className="page-subtitle">{t('select_project_review', 'Select a project to review deliverables and collaborate.')}</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="header-search hidden sm:flex shrink-0" style={{ width: '280px', marginRight: '0.5rem' }}>
                                    <Search className="search-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t('search_projects', 'Search projects by name, ref, or client...')}
                                        className="search-input"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-lg p-1.5 border border-white/10 shrink-0">
                                    <button
                                        type="button"
                                        className={`p-2 rounded-md transition-all duration-200`}
                                        style={{ outline: 'none', border: 'none', background: hubViewMode === 'grid' ? 'var(--input-bg-focus)' : 'transparent', color: hubViewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                        onClick={() => setHubViewMode('grid')}
                                        title="Thumbnail View"
                                    ><Grid size={18} /></button>
                                    <button
                                        type="button"
                                        className={`p-2 rounded-md transition-all duration-200`}
                                        style={{ outline: 'none', border: 'none', background: hubViewMode === 'list' ? 'var(--input-bg-focus)' : 'transparent', color: hubViewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                        onClick={() => setHubViewMode('list')}
                                        title="List View"
                                    ><List size={18} /></button>
                                </div>
                            </div>
                        </header>

                        <motion.div className={hubViewMode === 'grid' ? "projects-grid" : "flex flex-col space-y-3"} variants={containerVariants} initial="hidden" animate="show">
                            {projects.filter(p => {
                                if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') return true;
                                const q = String(searchQuery).toLowerCase().trim();
                                return (p.name && String(p.name).toLowerCase().includes(q)) ||
                                    (p.client && String(p.client).toLowerCase().includes(q)) ||
                                    (p.reference && String(p.reference).toLowerCase().includes(q));
                            }).map(p => (
                                hubViewMode === 'grid' ? (
                                    <motion.div
                                        key={p.id}
                                        variants={itemVariants}
                                        className="project-card glass-panel cursor-pointer group flex flex-col justify-between"
                                        onClick={() => navigate(`/project/${p.id}`)}
                                        whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.2)", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                                        style={{ padding: '1rem', minHeight: '260px' }}
                                    >
                                        <div
                                            style={{ height: '140px', flexShrink: 0, width: '100%', borderRadius: '0.375rem', marginBottom: '1rem', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
                                        >
                                            <img
                                                src={projectImages[parseInt(p.id.replace(/\D/g, '') || 0) % projectImages.length]}
                                                alt="Project Thumbnail"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'opacity 0.3s' }}
                                                onMouseOver={e => e.currentTarget.style.opacity = 1}
                                                onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>
                                                        <span style={{ color: 'var(--accent-cyan)', marginRight: '0.5rem' }}>{p.reference}</span>
                                                        {p.name === 'Unknown' ? t('project', 'Project') : p.name}
                                                    </h3>
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{p.client}</p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px', border: '1px solid',
                                                    ...(p.status === 'Completed' ? { backgroundColor: 'var(--success-bg, rgba(16, 185, 129, 0.1))', color: 'var(--status-success)', borderColor: 'var(--success-border, rgba(16, 185, 129, 0.2))' } :
                                                        p.status === 'Queue' || p.status === 'Pending' ? { backgroundColor: 'var(--neutral-bg, rgba(100, 116, 139, 0.1))', color: 'var(--text-secondary)', borderColor: 'var(--neutral-border, rgba(100, 116, 139, 0.2))' } :
                                                            { backgroundColor: 'var(--info-bg, rgba(6, 182, 212, 0.1))', color: 'var(--accent-cyan)', borderColor: 'var(--info-border, rgba(6, 182, 212, 0.2))' })
                                                }}>
                                                    {t(`stage_${p.status.toLowerCase().replace(' ', '_')}`, p.status)}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                                    <FolderArchive size={14} style={{ opacity: 0.7 }} /> {p.progress === 100 ? t('all_delivered', 'All Delivered') : t('pending_files', 'Pending Files')}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={p.id}
                                        variants={itemVariants}
                                        className="glass-panel flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors border-l-4 border-l-transparent hover:border-l-accent-cyan"
                                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', gap: '1rem', minHeight: '76px' }}
                                        onClick={() => navigate(`/project/${p.id}`)}
                                    >
                                        <div className="flex items-center gap-4 min-w-0" style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                                            <div className="shrink-0 rounded-lg flex items-center justify-center" style={{ width: '40px', height: '40px', minWidth: '40px', flexShrink: 0, backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                                <FolderArchive size={20} className="text-accent-cyan opacity-80" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-[var(--text-primary)] tracking-wide truncate">
                                                    <span className="text-accent-cyan mr-2">{p.reference}</span>
                                                    {p.name === 'Unknown' ? t('project', 'Project') : p.name}
                                                </h3>
                                                <div className="text-xs text-secondary mt-0.5 truncate">{p.client} • {t('ref', 'Ref')}: {p.reference}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                p.status === 'Queue' || p.status === 'Pending' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                    'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
                                                }`}>
                                                {t(`stage_${p.status.toLowerCase().replace(' ', '_')}`, p.status)}
                                            </span>
                                            <div className="flex items-center text-xs text-tertiary hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '8rem', justifyContent: 'flex-end' }}>
                                                <FolderArchive size={14} className="opacity-70" /> {p.progress === 100 ? t('all_delivered', 'All Delivered') : t('pending_files', 'Pending Files')}
                                            </div>
                                            <button className="transition-colors p-2 rounded-lg" style={{ outline: 'none', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="project-detail-view">
                        <header className="project-header-container">
                            <div className="project-header-left">
                                <button className="back-btn" onClick={() => {
                                    if (selectedFolder) {
                                        setSelectedFolder(null);
                                    } else {
                                        if (location.pathname.startsWith('/project/')) {
                                            navigate('/assets');
                                        } else {
                                            setSelectedProject(null);
                                        }
                                    }
                                }}>
                                    <ArrowLeft size={16} /> {selectedFolder ? t('back_to_folders', 'Back to Folders') : t('back_to_hub', 'Back to Hub')}
                                </button>
                                <div>
                                    <div className="project-title-row">
                                        {selectedProject.reference && (
                                            <span className="text-[11px] font-mono bg-[#2A2D35] text-[var(--accent-cyan)] font-medium px-2 py-0.5 rounded border border-[#3A3D45] flex items-center justify-center -ml-1 h-fit leading-none mt-1 box-border">
                                                {selectedProject.reference}
                                            </span>
                                        )}
                                        <h1 className="project-title">{selectedProject.name} {selectedFolder && <span className="text-secondary font-normal mx-2">/ {selectedFolder.name}</span>}</h1>
                                    </div>
                                    <p className="project-subtitle">
                                        {selectedProject.client} • {t(`stage_${selectedProject.status.toLowerCase().replace(' ', '_')}`, selectedProject.status)}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <div className="content-grid">
                            <div className="main-col">
                                <div className="dashboard-module glass-panel mt-6">
                                    <div className="section-header flex justify-between items-center">
                                        <h2 className="section-title flex items-center gap-2 mb-0">
                                            <FolderArchive size={20} /> {selectedFolder ? t('assets_directory', 'Assets Directory') : t('project_folders', 'Project Folders')}
                                        </h2>
                                        {!selectedFolder && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                            >
                                                {isCreatingFolder ? t('cancel', 'Cancel') : `+ ${t('new_folder', 'New Folder')}`}
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        {!selectedFolder ? (
                                            <>
                                                <AnimatePresence>
                                                    {isCreatingFolder && (
                                                        <motion.form
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            onSubmit={handleCreateFolder}
                                                            className="mb-6 flex gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl"
                                                        >
                                                            <input
                                                                type="text"
                                                                className="modal-input"
                                                                placeholder={t('folder_name_placeholder', 'Folder Name (e.g. Drafts 2)')}
                                                                value={newFolderName}
                                                                onChange={e => setNewFolderName(e.target.value)}
                                                                style={{ flex: 1, padding: '0.625rem 1rem' }}
                                                                autoFocus
                                                            />
                                                            <button type="submit" className="btn btn-primary whitespace-nowrap px-6">{t('create_folder', 'Create Folder')}</button>
                                                        </motion.form>
                                                    )}
                                                </AnimatePresence>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {projectFolders.map(f => {
                                                        const counts = assets.filter(a => a.projectId === selectedProject.id && a.folderId === f.id).length;
                                                        return (
                                                            <div
                                                                key={f.id}
                                                                className="glass-panel flex items-center gap-4 cursor-pointer hover:border-accent-cyan transition-colors group"
                                                                style={{ padding: '1.25rem' }}
                                                                onClick={() => setSelectedFolder(f)}
                                                            >
                                                                <div className="p-3 bg-accent-cyan/10 rounded-xl text-accent-cyan group-hover:scale-110 transition-transform">
                                                                    <FolderArchive size={24} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-[var(--text-primary)] font-medium tracking-wide m-0">{f.name}</h3>
                                                                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1 mb-0">
                                                                        {counts} {counts === 1 ? t('file', 'file') : t('files', 'files')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h2 className="section-title mb-0">{selectedFolder.name}</h2>
                                                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--glass-border)' }}>
                                                        <button
                                                            style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', transition: 'all 0.2s', backgroundColor: viewMode === 'grid' ? 'var(--input-bg-focus)' : 'transparent', color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
                                                            onClick={() => setViewMode('grid')}
                                                        ><Grid size={16} /></button>
                                                        <button
                                                            style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', transition: 'all 0.2s', backgroundColor: viewMode === 'list' ? 'var(--input-bg-focus)' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
                                                            onClick={() => setViewMode('list')}
                                                        ><List size={16} /></button>
                                                    </div>
                                                </div>

                                                {projectAssets.length > 0 ? (
                                                    <div className={viewMode === 'grid' ? "assets-grid-small" : "flex flex-col space-y-2"} style={{ display: viewMode === 'list' ? 'flex' : '' }}>
                                                        {projectAssets.map(a => (
                                                            viewMode === 'grid' ? (
                                                                <div
                                                                    key={a.id}
                                                                    className="asset-card-small"
                                                                    onClick={() => {
                                                                        if (a.type === 'Render' || a.image) {
                                                                            setSelectedImage(a);
                                                                        }
                                                                    }}
                                                                >
                                                                    {a.type === 'Archive' || a.name.endsWith('.zip') ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                                                                            <FileArchive size={48} className="text-accent-cyan opacity-80" />
                                                                        </div>
                                                                    ) : a.type === 'Document' ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                                                                            <FileText size={48} className="text-emerald-400 opacity-80" />
                                                                        </div>
                                                                    ) : a.type === 'CAD Model' ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                                                                            <PenTool size={48} className="text-orange-400 opacity-80" />
                                                                        </div>
                                                                    ) : (
                                                                        <img src={a.image} alt={a.name} />
                                                                    )}
                                                                    <div className="asset-overlay">
                                                                        <span className="block truncate">{a.name}</span>
                                                                        <span className="text-xs text-secondary mt-1 block">{a.type}</span>
                                                                    </div>
                                                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0 }}>
                                                                        <div style={{ padding: '0.375rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '0.25rem', color: 'white' }}>
                                                                            <Eye size={16} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    key={a.id}
                                                                    className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--glass-border)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedImage(a);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-glass/30 flex-shrink-0 bg-dark/60 flex items-center justify-center">
                                                                            {a.type === 'Archive' || a.name.endsWith('.zip') ? (
                                                                                <FileArchive size={20} className="text-accent-cyan opacity-80" />
                                                                            ) : a.type === 'Document' ? (
                                                                                <FileText size={20} className="text-emerald-400 opacity-80" />
                                                                            ) : a.type === 'CAD Model' ? (
                                                                                <PenTool size={20} className="text-orange-400 opacity-80" />
                                                                            ) : (
                                                                                <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-white text-sm tracking-wide">{a.name}</div>
                                                                            <div className="text-[11px] text-secondary mt-0.5">{a.size} • {a.type}</div>
                                                                        </div>
                                                                    </div>
                                                                    <button className="p-2 text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors">
                                                                        <Eye size={16} />
                                                                    </button>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-16 text-secondary w-full border border-dashed border-[var(--glass-border)] rounded-xl bg-[var(--input-bg)] flex flex-col items-center justify-center">
                                                        <ImageIcon size={48} className="mb-4 opacity-30" />
                                                        <p>{t('folder_empty', 'This folder is empty.')}</p>
                                                        <p className="text-sm mt-1 opacity-70">{t('upload_assets_to', 'Upload new assets to {{folderName}}.', { folderName: selectedFolder.name })}</p>
                                                    </div>
                                                )}

                                                <div className="deliverables-system flex flex-col mt-6 pt-6 border-t border-glass">
                                                    <label
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', marginTop: '1rem', border: '1px dashed var(--glass-border-highlight)', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }}
                                                        onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                                        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                                                    >
                                                        <Upload size={16} /> {isUploading ? t('uploading', 'Uploading...') : t('upload_new_assets_to', 'Upload New Assets to {{folderName}}', { folderName: selectedFolder.name })}
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="side-col">
                                <div className="dashboard-module glass-panel mt-6 flex flex-col" style={{ maxHeight: '600px' }}>
                                    <div className="section-header shrink-0 pb-4">
                                        <h2 className="section-title flex items-center gap-2 mb-0">
                                            <MessageSquare size={16} />
                                            <span>{t('discussion', 'Discussion')}</span>
                                        </h2>
                                    </div>
                                    <div className="comments-list flex-1 overflow-y-auto mt-4" style={{ padding: '0.5rem 1.5rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[...comments].reverse().map(c => (
                                            <div key={c.id} className="comment shrink-0 m-0">
                                                <div className="comment-header">
                                                    <span className="comment-author">{c.author}</span>
                                                    <span className="comment-time">{c.time}</span>
                                                </div>
                                                <p className="comment-text">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="shrink-0 px-6 py-4 border-t border-[var(--glass-border)] bg-[var(--bg-secondary)]/30 rounded-b-xl">
                                        <form className="flex gap-3 w-full items-stretch" onSubmit={handleSendComment}>
                                            <input
                                                type="text"
                                                className="modal-input flex-1 min-w-0 m-0"
                                                placeholder={t('add_feedback', 'Add feedback...')}
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                            />
                                            <button type="submit" className="btn btn-primary px-4 shrink-0 m-0 flex items-center justify-center">
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Annotation Modal */}
            <AnimatePresence>
                {selectedImage && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 lg:p-4 m-0 origin-center"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            key="lightbox-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full h-full lg:rounded-2xl bg-dark/95 border border-glass overflow-hidden shadow-2xl flex flex-col lg:flex-row"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-4 right-4 z-40">
                                <button className="p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-md border border-glass/50 shadow-lg" onClick={() => setSelectedImage(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Image Section - Maximized */}
                            <div className="flex-1 min-w-0 bg-black/80 flex items-center justify-center p-4 overflow-hidden relative" style={{ height: '100%' }}>
                                <div
                                    style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'crosshair' }}
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                                        const text = window.prompt('Enter your annotation for this point:');
                                        if (text) {
                                            setAnnotations([...annotations, {
                                                id: annotations.length + 1,
                                                x,
                                                y,
                                                text,
                                                title: 'User Note',
                                                time: 'Just now'
                                            }]);
                                        }
                                    }}
                                >
                                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
                                        <img src={selectedImage.image} alt={selectedImage.name} style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', borderRadius: '0.5rem', objectFit: 'contain' }} />

                                        {/* Annotations overlayed on image */}
                                        {annotations.map(ann => (
                                            <div
                                                key={ann.id}
                                                style={{ left: `${ann.x}%`, top: `${ann.y}%`, position: 'absolute' }}
                                                className="w-8 h-8 -ml-4 -mt-4 bg-accent-cyan rounded-full flex items-center justify-center text-dark text-sm font-bold cursor-pointer ring-4 ring-accent-cyan/40 transform transition hover:scale-110"
                                                onClick={(e) => { e.stopPropagation(); alert(ann.text); }}
                                            >
                                                {ann.id}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Section */}
                            <div className="w-full lg:w-[400px] xl:w-[450px] bg-dark/80 border-t lg:border-t-0 lg:border-l border-glass flex flex-col shrink-0 h-full backdrop-blur-xl relative z-30">
                                <div className="p-6 border-b border-glass flex items-center gap-4 bg-white/5">
                                    <div className="p-2 bg-accent-cyan/10 rounded-lg text-accent-cyan">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white tracking-wide">{t('image_feedback', 'Image Feedback')}</h3>
                                        <p className="text-xs text-secondary mt-0.5">{selectedImage.name}</p>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                                    <div className="space-y-3">
                                        {/* Annotations */}
                                        {annotations.map(ann => (
                                            <div key={ann.id} className="text-secondary text-sm p-4 bg-dark/40 rounded-xl border border-glass/50 hover:bg-white/5 transition-colors group cursor-pointer relative overflow-hidden" style={{ marginBottom: '0.75rem' }}>
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan flexItems-center justify-center text-xs font-bold leading-none inline-flex items-center justify-center">{ann.id}</span>
                                                    <span className="text-white font-medium">{ann.title}</span>
                                                    <span className="text-[10px] text-tertiary ml-auto">{ann.time}</span>
                                                </div>
                                                <p className="leading-relaxed pl-7">{ann.text}</p>
                                            </div>
                                        ))}

                                        {/* Global Image Comments */}
                                        {(assets.find(a => a.id === selectedImage.id)?.comments || []).map((c, i) => (
                                            <div key={i} className="text-secondary text-sm p-4 bg-dark/40 rounded-xl border border-glass/50 hover:bg-white/5 transition-colors group relative overflow-hidden" style={{ marginBottom: '0.75rem' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-emerald-400 font-medium">{c.author}</span>
                                                    <span className="text-[10px] text-tertiary ml-auto">{c.time}</span>
                                                </div>
                                                <p className="leading-relaxed">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 border-t border-glass bg-white/5 backdrop-blur-sm">
                                    <form
                                        className="flex gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!newImageComment.trim()) return;
                                            addAssetComment(selectedImage.id, {
                                                author: 'Client',
                                                text: newImageComment,
                                                time: 'Just now'
                                            });
                                            setNewImageComment('');
                                        }}
                                    >
                                        <input
                                            type="text"
                                            className="modal-input"
                                            placeholder={t('add_feedback', 'Add feedback...')}
                                            value={newImageComment}
                                            onChange={e => setNewImageComment(e.target.value)}
                                            style={{ flex: 1, padding: '0.75rem' }}
                                        />
                                        <button type="submit" className="btn btn-primary px-3">
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectManagement;
