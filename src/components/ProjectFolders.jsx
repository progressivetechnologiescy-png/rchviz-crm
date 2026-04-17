import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { Folder, Image as ImageIcon, Plus, Trash2, ArrowLeft, MessageSquare, FolderPlus, ImagePlus, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageAnnotator from './ImageAnnotator';
import { useTranslation } from 'react-i18next';

const ProjectFolders = ({ projectId }) => {
    const { t } = useTranslation();
    const { folders, assets, currentUser, addFolder, addAsset, deleteFolder, deleteAsset, setAssetAsCover } = useStore();
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [annotatorAssetId, setAnnotatorAssetId] = useState(null);
    const [folderToDelete, setFolderToDelete] = useState(null);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFoldersForAction, setSelectedFoldersForAction] = useState([]);
    const [selectedAssetsForAction, setSelectedAssetsForAction] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [assetBulkDeleteConfirm, setAssetBulkDeleteConfirm] = useState(false);

    const STANDARD_ORDER = ['Drafts 1', 'Drafts 2', 'AI', 'Client References', 'Final'];

    const projectFolders = folders
        .filter(f => f.projectId === projectId)
        .sort((a, b) => {
            const indexA = STANDARD_ORDER.indexOf(a.name);
            const indexB = STANDARD_ORDER.indexOf(b.name);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });
    const projectAssets = assets.filter(a => a.projectId === projectId);

    const handleFolderClick = (folderId) => {
        setSelectedFolder(folderId);
    };

    const handleAssetClick = (asset) => {
        setAnnotatorAssetId(asset.id);
    };

    const handleAddFolder = () => {
        setIsCreateFolderModalOpen(true);
    };

    const submitAddFolder = (e) => {
        e.preventDefault();
        if (newFolderName && newFolderName.trim()) {
            addFolder({ projectId, name: newFolderName.trim() });
        }
        setIsCreateFolderModalOpen(false);
        setNewFolderName('');
    };

    const handleCreateStandardFolders = () => {
        STANDARD_ORDER.forEach(name => {
            addFolder({ projectId, name });
        });
    };

    const handleDeleteFolder = (folderId, folderName, event) => {
        event.stopPropagation();
        setFolderToDelete({ id: folderId, name: folderName });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && selectedFolder) {
            setIsUploading(true);
            setUploadProgress(10);
            const reader = new FileReader();
            
            reader.onprogress = (ev) => {
                if (ev.lengthComputable) {
                    setUploadProgress(Math.max(10, Math.round((ev.loaded / ev.total) * 100)));
                }
            };

            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
            const type = file.type.startsWith('image/') ? 'Image' : 'File';
            
            reader.onloadend = () => {
                const base64string = reader.result;
                let simulatedProgress = 10;
                
                const interval = setInterval(() => {
                    simulatedProgress += 15;
                    if(simulatedProgress > 95) {
                        clearInterval(interval);
                        setUploadProgress(100);
                        addAsset({
                            projectId,
                            folderId: selectedFolder,
                            name: file.name,
                            type: type,
                            size: sizeInMB + ' MB',
                            url: base64string,
                            comments: [],
                            annotations: []
                        });
                        setTimeout(() => {
                            setIsUploading(false);
                            setUploadProgress(0);
                        }, 400);
                    } else {
                        setUploadProgress(simulatedProgress);
                    }
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAsset = (asset, event) => {
        event.stopPropagation();
        setAssetToDelete(asset);
    };

    // Derived asset from Zustand so updates flow correctly
    const annotatorAsset = annotatorAssetId ? assets.find(a => a.id === annotatorAssetId) : null;

    return (
        <div className="project-folders-container flex flex-col h-[400px]">
            <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {selectedFolder && (
                        <button
                            className="p-1 hover:bg-[var(--hover-bg)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            onClick={() => setSelectedFolder(null)}
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Folder size={20} className="text-accent-blue" />
                        {selectedFolder
                            ? projectFolders.find(f => f.id === selectedFolder)?.name || t('folder_view', 'Folder View')
                            : t('project_folders', 'Project Folders')}
                    </h2>
                </div>
                {!selectedFolder ? (
                    <div className="flex items-center gap-2">
                        {selectedFoldersForAction.length > 0 && (
                            <button
                                onClick={() => setBulkDeleteConfirm(true)}
                                className="text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                            >
                                <Trash2 size={14} /> {t('delete_selected', `Delete (${selectedFoldersForAction.length})`)}
                            </button>
                        )}
                        <button
                            onClick={handleCreateStandardFolders}
                            className="text-xs font-medium bg-[var(--input-bg)] hover:bg-[var(--hover-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                            title={t('quick_add_standard_folders', 'Quick-add standard folders')}
                        >
                            <FolderPlus size={14} /> {t('add_standards', 'Add Standards')}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {!selectedFolder ? (
                        <motion.div
                            key="folders-grid"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={projectFolders.length === 0 ? "flex h-full w-full" : "grid grid-cols-2 lg:grid-cols-4 gap-4"}
                        >
                            {projectFolders.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 mx-4 my-8">
                                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-accent-blue rounded-full mb-4 ring-1 ring-white/10 shadow-lg">
                                        <FolderPlus size={32} />
                                    </div>
                                    <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">{t('no_folders_yet', 'No folders yet')}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm">{t('get_started_folders', 'Get started by setting up the standard folder structure for your project drafts and deliverables.')}</p>
                                    <div className="flex sm:flex-row flex-col gap-3">
                                        <button onClick={handleCreateStandardFolders} className="btn btn-primary shadow-lg shadow-cyan-500/20 px-6">
                                            {t('create_standard_folders', 'Create Standard Folders')}
                                        </button>
                        <button onClick={handleAddFolder} className="btn btn-secondary px-6">
                            {t('custom_folder', 'Custom Folder')}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {selectedAssetsForAction.length > 0 && (
                            <button
                                onClick={() => setAssetBulkDeleteConfirm(true)}
                                className="text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors relative z-30"
                            >
                                <Trash2 size={14} /> {t('delete_selected', `Delete (${selectedAssetsForAction.length})`)}
                            </button>
                        )}
                    </div>
                )}
            </div>
                                <>
                                    {projectFolders.map(folder => {
                                        const folderAssets = projectAssets.filter(a => a.folderId === folder.id);
                                        const totalAnnotations = folderAssets.reduce((sum, asset) => sum + (asset.annotations?.length || 0), 0);
                                        const openAnnotations = folderAssets.reduce((sum, asset) => sum + (asset.annotations?.filter(a => a.status !== 'resolved').length || 0), 0);

                                        return (
                                            <div
                                                key={folder.id}
                                                className={`bg-[var(--bg-secondary)] border ${selectedFoldersForAction.includes(folder.id) ? 'border-accent-blue bg-blue-500/5' : 'border-[var(--glass-border)]'} rounded-xl p-4 hover:bg-[var(--input-bg)] transition-colors cursor-pointer group flex flex-col items-center text-center shadow-sm hover:shadow relative`}
                                                onClick={() => handleFolderClick(folder.id)}
                                            >
                                                {/* Selection Checkbox */}
                                                <div 
                                                    className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center transition-all z-20 shadow-sm ${selectedFoldersForAction.includes(folder.id) ? 'bg-accent-blue text-white opacity-100' : 'bg-black/20 border border-white/20 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-black/40'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFoldersForAction(prev => 
                                                            prev.includes(folder.id) ? prev.filter(id => id !== folder.id) : [...prev, folder.id]
                                                        );
                                                    }}
                                                >
                                                    {selectedFoldersForAction.includes(folder.id) && <CheckCircle size={12} />}
                                                </div>

                                                {totalAnnotations > 0 && (
                                                    <div className={`absolute top-2 left-9 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1 backdrop-blur-md ${openAnnotations > 0 ? 'bg-accent-blue/90' : 'bg-green-500/90'}`}>
                                                        {openAnnotations > 0 ? (
                                                            <><MessageSquare size={10} /> {openAnnotations}</>
                                                        ) : (
                                                            <><CheckCircle size={10} /></>
                                                        )}
                                                    </div>
                                                )}
                                                <button
                                                    className="absolute top-2 right-2 p-1.5 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-black/20 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                                                    onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                                                    title={t('delete_folder', 'Delete Folder')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-accent-blue rounded-xl shadow-inner border border-blue-500/30 mb-3 group-hover:scale-105 transition-transform">
                                                    <Folder size={32} />
                                                </div>
                                                <div className="font-medium text-[var(--text-primary)] text-sm tracking-wide w-full truncate">{folder.name}</div>
                                                <div className="text-[11px] text-[var(--text-secondary)] mt-1">{folderAssets.length} {t('files', 'files')}</div>
                                            </div>
                                        );
                                    })}

                                    {/* Add Folder Button */}
                                    <div
                                        onClick={handleAddFolder}
                                        className="border border-dashed border-[var(--glass-border)] rounded-xl p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 hover:border-[var(--glass-border-highlight)] min-h-[140px]"
                                    >
                                        <div className="p-2 mb-1 text-[var(--text-secondary)]">
                                            <FolderPlus size={24} />
                                        </div>
                                        <div className="text-xs font-medium text-[var(--text-secondary)]">{t('add_folder', 'Add Folder')}</div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="assets-grid"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            {projectAssets.filter(a => a.folderId === selectedFolder).map(asset => {
                                const totalAnn = asset.annotations?.length || 0;
                                const openAnn = asset.annotations?.filter(a => a.status !== 'resolved').length || 0;

                                return (
                                    <div
                                        key={asset.id}
                                        className={`relative bg-[var(--bg-secondary)] border ${selectedAssetsForAction.includes(asset.id) ? 'border-accent-blue bg-blue-500/5' : 'border-[var(--glass-border)]'} rounded-xl overflow-hidden hover:bg-[var(--input-bg)] transition-all cursor-pointer group shadow-sm hover:shadow-md`}
                                        onClick={() => handleAssetClick(asset)}
                                    >
                                        {/* Asset Selection Checkbox */}
                                        <div 
                                            className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center transition-all z-20 shadow-sm ${selectedAssetsForAction.includes(asset.id) ? 'bg-accent-blue text-white opacity-100' : 'bg-black/20 border border-white/20 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-black/40'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAssetsForAction(prev => 
                                                    prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]
                                                );
                                            }}
                                        >
                                            {selectedAssetsForAction.includes(asset.id) && <CheckCircle size={12} />}
                                        </div>

                                        {/* Set Cover Button */}
                                        {(asset.type === 'Render' || asset.type === 'Image') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAssetAsCover(projectId, asset.id);
                                                }}
                                                className={`absolute top-2 right-10 p-1.5 rounded-full shadow-md z-20 transition-opacity backdrop-blur-md ${asset.comments?.some(c=>c.type==='cover') ? 'text-yellow-400 bg-yellow-500/20 opacity-100' : 'text-white bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
                                                title={t('set_cover', 'Set as Thumbnail')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={asset.comments?.some(c=>c.type==='cover') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => handleDeleteAsset(asset, e)}
                                            className="absolute top-2 right-2 text-white bg-red-500/80 hover:bg-red-600 p-1.5 rounded-full shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                                            title={t('delete', 'Delete')}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        {totalAnn > 0 && (
                                            <div className={`absolute top-2 left-9 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1 backdrop-blur-md ${openAnn > 0 ? 'bg-accent-blue/90' : 'bg-green-500/90'}`}>
                                                {openAnn > 0 ? (
                                                    <><MessageSquare size={10} /> {openAnn}</>
                                                ) : (
                                                    <><CheckCircle size={10} /> {t('resolved', 'Resolved')}</>
                                                )}
                                            </div>
                                        )}
                                        <img src={asset.url} alt={asset.name} className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="p-3 bg-[var(--bg-secondary)] backdrop-blur-md">
                                            <div className="font-medium text-[var(--text-primary)] text-sm truncate">{asset.name}</div>
                                            <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-secondary)]">
                                                <span>{asset.size}</span>
                                                <span className={`flex items-center gap-1 font-semibold ${totalAnn > 0 && openAnn === 0 ? 'text-green-500' : openAnn > 0 ? 'text-accent-blue' : 'text-[var(--text-tertiary)]'}`}>
                                                    {totalAnn > 0 && openAnn === 0 ? (
                                                        <><CheckCircle size={10} /> {t('resolved', 'Resolved')}</>
                                                    ) : openAnn > 0 ? (
                                                        <><MessageSquare size={10} /> {openAnn}</>
                                                    ) : (
                                                        <><MessageSquare size={10} /> 0</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Upload Area inside folder */}
                            <label className={`relative border border-dashed border-[var(--glass-border)] rounded-xl hover:bg-[var(--hover-bg)] transition-colors flex flex-col items-center justify-center text-center overflow-hidden min-h-[180px] ${isUploading ? 'cursor-wait opacity-100 border-accent-cyan/50' : 'cursor-pointer opacity-70 hover:opacity-100 hover:border-[var(--glass-border-highlight)]'}`}>
                                {isUploading && (
                                    <div className="absolute top-0 left-0 h-full bg-accent-cyan/10 transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                <ImagePlus size={24} className={`mb-2 relative z-10 transition-colors ${isUploading ? 'text-accent-cyan' : 'text-[var(--text-secondary)]'}`} />
                                <div className={`text-xs font-medium relative z-10 transition-colors ${isUploading ? 'text-accent-cyan' : 'text-[var(--text-secondary)]'}`}>
                                    {isUploading ? t('uploading', `Uploading... ${uploadProgress}%`) : t('upload_image', 'Upload Image')}
                                </div>
                            </label>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals rendered via Portal to escape CSS containing blocks */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* Render Image Annotator Modal */}
                    <AnimatePresence>
                        {annotatorAsset && (
                            <ImageAnnotator
                                asset={annotatorAsset}
                                onClose={() => setAnnotatorAssetId(null)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Create Folder Modal */}
                    <AnimatePresence>
                        {isCreateFolderModalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setIsCreateFolderModalOpen(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <FolderPlus size={20} className="text-accent-blue" />
                                            {t('create_custom_folder', 'Create Custom Folder')}
                                        </h3>
                                        <button 
                                            className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
                                            onClick={() => setIsCreateFolderModalOpen(false)}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={submitAddFolder}>
                                        <div className="mb-6">
                                            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">
                                                {t('folder_name', 'Folder Name')}
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder-[var(--text-tertiary)]"
                                                placeholder={t('e_g_drafts_3', 'e.g., Drafts 3')}
                                                autoFocus
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end items-center mt-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm flex-1"
                                                onClick={() => setIsCreateFolderModalOpen(false)}
                                            >
                                                {t('cancel', 'Cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20 font-medium text-sm flex-1"
                                            >
                                                {t('create_folder', 'Create Folder')}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Delete Confirmation Modal */}
                    <AnimatePresence>
                        {folderToDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setFolderToDelete(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 text-red-500 mb-4">
                                        <div className="p-3 bg-red-500/10 rounded-full">
                                            <Trash2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{t('delete_folder', 'Delete Folder')}</h3>
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                                        {t('confirm_delete_folder', 'Are you sure you want to delete ')}<span className="text-white font-medium">"{folderToDelete.name}"</span>? {t('cannot_be_undone_folder', 'This action cannot be undone and will remove all files inside.')}
                                    </p>
                                    <div className="flex gap-3 justify-end mt-2">
                                        <button
                                            className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm"
                                            onClick={() => setFolderToDelete(null)}
                                        >
                                            {t('cancel', 'Cancel')}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium text-sm"
                                            onClick={() => {
                                                deleteFolder(folderToDelete.id);
                                                if (selectedFolder === folderToDelete.id) {
                                                    setSelectedFolder(null);
                                                }
                                                setFolderToDelete(null);
                                            }}
                                        >
                                            {t('delete', 'Delete')}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Asset Delete Confirmation Modal */}
                    <AnimatePresence>
                        {assetToDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setAssetToDelete(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 text-red-500 mb-4">
                                        <div className="p-3 bg-red-500/10 rounded-full">
                                            <Trash2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{t('delete_image', 'Delete Image')}</h3>
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                                        {t('confirm_delete_image', 'Are you sure you want to delete ')}<span className="text-white font-medium">"{assetToDelete.name}"</span>? {t('cannot_be_undone_image', 'This action cannot be undone.')}
                                    </p>
                                    <div className="flex gap-3 justify-end mt-2">
                                        <button
                                            className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm"
                                            onClick={() => setAssetToDelete(null)}
                                        >
                                            {t('cancel', 'Cancel')}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium text-sm"
                                            onClick={() => {
                                                deleteAsset(assetToDelete.id);
                                                setAssetToDelete(null);
                                            }}
                                        >
                                            {t('delete', 'Delete')}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Delete Modal */}
                    <AnimatePresence>
                        {bulkDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setBulkDeleteConfirm(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 text-red-500 mb-4">
                                        <div className="p-3 bg-red-500/10 rounded-full">
                                            <Trash2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{t('delete_folders', 'Delete Folders')}</h3>
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                                        {t('confirm_bulk_delete', 'Are you sure you want to delete ')}<span className="text-white font-medium">{selectedFoldersForAction.length}</span> {t('folders', 'folders')}? {t('cannot_be_undone_folder', 'This action cannot be undone and will remove all files inside.')}
                                    </p>
                                    <div className="flex gap-3 justify-end mt-2">
                                        <button
                                            className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm"
                                            onClick={() => setBulkDeleteConfirm(false)}
                                        >
                                            {t('cancel', 'Cancel')}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium text-sm"
                                            onClick={() => {
                                                selectedFoldersForAction.forEach(id => deleteFolder(id));
                                                setSelectedFoldersForAction([]);
                                                setBulkDeleteConfirm(false);
                                            }}
                                        >
                                            {t('delete', 'Delete')}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Asset Bulk Delete Modal */}
                    <AnimatePresence>
                        {assetBulkDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setAssetBulkDeleteConfirm(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 text-red-500 mb-4">
                                        <div className="p-3 bg-red-500/10 rounded-full">
                                            <Trash2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{t('delete_assets', 'Delete Files')}</h3>
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                                        {t('confirm_bulk_delete', 'Are you sure you want to delete ')}<span className="text-white font-medium">{selectedAssetsForAction.length}</span> {t('files', 'files')}? {t('cannot_be_undone_asset', 'This action cannot be undone.')}
                                    </p>
                                    <div className="flex gap-3 justify-end mt-2">
                                        <button
                                            className="px-4 py-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium text-sm"
                                            onClick={() => setAssetBulkDeleteConfirm(false)}
                                        >
                                            {t('cancel', 'Cancel')}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium text-sm"
                                            onClick={() => {
                                                selectedAssetsForAction.forEach(id => deleteAsset(id));
                                                setSelectedAssetsForAction([]);
                                                setAssetBulkDeleteConfirm(false);
                                            }}
                                        >
                                            {t('delete', 'Delete')}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </div>
    );
};

export default ProjectFolders;
