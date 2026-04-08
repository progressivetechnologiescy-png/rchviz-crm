import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, CheckCircle, Clock, MapPin, MousePointer2, MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

const COLORS = [
    { id: 'cyan', hex: '#00f0ff' },
    { id: 'pink', hex: '#ff0055' },
    { id: 'green', hex: '#00ffaa' },
    { id: 'yellow', hex: '#ffea00' },
    { id: 'purple', hex: '#b200ff' }
];

const ImageAnnotator = ({ asset, onClose }) => {
    const { t } = useTranslation();
    const { addAnnotation, resolveAnnotation, currentUser } = useStore();
    const [hoveredPin, setHoveredPin] = useState(null);
    const [newPinCoords, setNewPinCoords] = useState(null);
    const [newComment, setNewComment] = useState("");
    const imgWrapperRef = useRef(null);

    // Advanced Tool State
    const [currentTool, setCurrentTool] = useState('pin'); // 'pin' | 'arrow'
    const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);

    // Drawing UI State
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState(null);
    const [drawCurrent, setDrawCurrent] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);

    // Image Scaling State
    const [imgDimensions, setImgDimensions] = useState(null);

    const handleImageLoad = (e) => {
        setImgDimensions({
            w: e.target.naturalWidth,
            h: e.target.naturalHeight
        });
    };

    const getRelativeCoords = (e) => {
        if (!imgWrapperRef.current) return { x: 0, y: 0 };
        const rect = imgWrapperRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        };
    };

    const handlePointerDown = (e) => {
        if (e.target.closest('.annotation-pin') || e.target.closest('.annotation-input-box') || e.target.closest('.annotator-toolbar')) {
            return;
        }

        const coords = getRelativeCoords(e);

        if (currentTool === 'arrow') {
            setIsDrawing(true);
            setDrawStart(coords);
            setDrawCurrent(coords);
            setNewPinCoords(null);
        } else {
            // Pin tool: Drop pin on click down
            const alignLeft = coords.x > 70;
            setNewPinCoords({ x: coords.x, y: coords.y, alignLeft });
        }
    };

    const handlePointerMove = (e) => {
        if (!isDrawing || currentTool !== 'arrow') return;
        setDrawCurrent(getRelativeCoords(e));
    };

    const handlePointerUp = (e) => {
        if (!isDrawing || currentTool !== 'arrow') return;
        setIsDrawing(false);

        // If dragged distance is tiny, treat it as a mistake or click
        const dx = drawCurrent.x - drawStart.x;
        const dy = drawCurrent.y - drawStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) { // 2% distance threshold
            // Valid arrow
            const alignLeft = drawCurrent.x > 70;
            setNewPinCoords({
                x: drawCurrent.x,
                y: drawCurrent.y,
                startX: drawStart.x,
                startY: drawStart.y,
                type: 'arrow',
                alignLeft
            });
        } else {
            setDrawStart(null);
            setDrawCurrent(null);
        }
    };

    // Cleanup drag if user leaves window or escapes
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsDrawing(false);
                setDrawStart(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);
    const submitNewPin = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !newPinCoords) return;

        const finalCoords = newPinCoords;
        addAnnotation(asset.id, {
            type: finalCoords.type || 'pin',
            x: finalCoords.x,
            y: finalCoords.y,
            startX: finalCoords.startX, // Optional, for arrows
            startY: finalCoords.startY,
            color: selectedColor,
            author: currentUser?.name || 'Guest',
            text: newComment
        });

        setNewPinCoords(null);
        setDrawStart(null);
        setDrawCurrent(null);
        setNewComment("");
    };

    const handleResolve = (annId) => {
        resolveAnnotation(asset.id, annId);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex bg-black/95 backdrop-blur-sm overflow-hidden"
        >
            {/* Main Image Area */}
            <div className={`relative flex items-center justify-center p-4 transition-all duration-300 ${showSidebar ? 'w-[calc(100%-380px)]' : 'w-full'} h-full`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 md:top-6 md:left-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors z-[110]"
                >
                    <X size={24} />
                </button>

                {/* Tightly wrapped relative container for accurate percentage-based absolute positioning */}
                <div
                    ref={imgWrapperRef}
                    className={`relative flex touch-none select-none ${currentTool === 'arrow' ? 'cursor-crosshair' : 'cursor-default'}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        height: imgDimensions ? '100%' : 'auto',
                        aspectRatio: imgDimensions ? `${imgDimensions.w} / ${imgDimensions.h}` : 'auto'
                    }}
                >
                    <img
                        src={asset.image}
                        alt={asset.name}
                        onLoad={handleImageLoad}
                        className="shadow-2xl pointer-events-none rounded-sm"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />

                    {/* SVG Layer for Arrows overlaying the image perfectly */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                        <defs>
                            {COLORS.map(c => (
                                <marker
                                    key={c.id}
                                    id={`arrowhead-${c.hex.replace('#', '')}`}
                                    markerWidth="10"
                                    markerHeight="7"
                                    refX="9"
                                    refY="3.5"
                                    orient="auto"
                                >
                                    <polygon points="0 0, 10 3.5, 0 7" fill={c.hex} />
                                </marker>
                            ))}
                        </defs>

                        {/* Render Saved Arrows */}
                        {asset.annotations?.filter(a => a.type === 'arrow').map((ann) => (
                            <line
                                key={`line-${ann.id}`}
                                x1={`${ann.startX}%`}
                                y1={`${ann.startY}%`}
                                x2={`${ann.x}%`}
                                y2={`${ann.y}%`}
                                stroke={ann.color || '#00f0ff'}
                                strokeWidth="3"
                                markerEnd={`url(#arrowhead-${(ann.color || '#00f0ff').replace('#', '')})`}
                                className="drop-shadow-lg"
                                style={{ strokeLinecap: 'round' }}
                            />
                        ))}

                        {/* Render Active Drawing Arrow */}
                        {isDrawing && drawStart && drawCurrent && currentTool === 'arrow' && (
                            <line
                                x1={`${drawStart.x}%`}
                                y1={`${drawStart.y}%`}
                                x2={`${drawCurrent.x}%`}
                                y2={`${drawCurrent.y}%`}
                                stroke={selectedColor}
                                strokeWidth="3"
                                markerEnd={`url(#arrowhead-${selectedColor.replace('#', '')})`}
                                strokeDasharray="4 2"
                                className="drop-shadow-lg opacity-80"
                            />
                        )}
                    </svg>

                    {/* Render Saved Pins / Points */}
                    {asset.annotations?.map((ann, index) => {
                        const isHovered = hoveredPin === ann.id;
                        const pinColor = ann.color || '#00f0ff';
                        // If it's an arrow, the pin acts as the tip indicator / label bounding box
                        return (
                            <div
                                key={ann.id}
                                className={`annotation-pin absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transform transition-transform cursor-pointer
                                    ${ann.status === 'resolved' ? 'bg-green-500 text-white border-2 border-green-600' : 'text-black'}
                                    ${isHovered ? 'scale-125 ring-4 ring-white/30 z-20' : 'z-20'}`
                                }
                                style={{
                                    left: `${ann.x}%`,
                                    top: `${ann.y}%`,
                                    backgroundColor: ann.status === 'resolved' ? '#22c55e' : pinColor,
                                    border: ann.status === 'resolved' ? 'none' : `1px solid rgba(255,255,255,0.4)`
                                }}
                                onMouseEnter={() => setHoveredPin(ann.id)}
                                onMouseLeave={() => setHoveredPin(null)}
                            >
                                {index + 1}
                            </div>
                        )
                    })}

                    {/* Render New Pin Input Over Image */}
                    {newPinCoords && (
                        <div
                            className="annotation-input-box absolute w-6 h-6 -ml-3 -mt-3 rounded-full text-black flex items-center justify-center text-[10px] font-bold shadow-lg z-30"
                            style={{
                                left: `${newPinCoords.x}%`,
                                top: `${newPinCoords.y}%`,
                                backgroundColor: selectedColor,
                                boxShadow: `0 0 0 4px ${selectedColor}40`
                            }}
                        >
                            +
                            <div
                                className={`absolute top-1/2 -translate-y-1/2 ${newPinCoords.alignLeft ? 'right-full mr-3 origin-right' : 'left-full ml-3 origin-left'} bg-[var(--bg-secondary)] backdrop-blur-3xl border border-[var(--glass-border)] p-3.5 rounded-xl shadow-2xl w-80 max-w-[calc(100vw-400px)]`}
                                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--glass-border)' }}
                            >
                                <form onSubmit={submitNewPin} className="flex flex-col gap-3">
                                    <textarea
                                        autoFocus
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={t('add_a_comment', "Add a comment...")}
                                        className="w-full bg-[var(--input-bg)] text-sm text-[var(--text-primary)] p-3 rounded-lg outline-none resize-none border border-[var(--glass-border)] focus:border-[var(--glass-border-highlight)] transition-colors placeholder:text-[var(--text-tertiary)]"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                submitNewPin(e);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewPinCoords(null);
                                                setDrawStart(null);
                                                setDrawCurrent(null);
                                            }}
                                            className="text-xs font-medium text-[var(--text-secondary)] hover:text-white px-2 py-1 rounded transition-colors"
                                        >
                                            {t('cancel', 'Cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-sm flex items-center gap-1.5 px-4 !py-1.5"
                                        >
                                            <Send size={15} /> {t('post_note', 'Post Note')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                {/* Toolbar Context */}
                <div className="annotator-toolbar absolute bottom-8 left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] backdrop-blur-3xl border border-[var(--glass-border)] rounded-full p-2 flex items-center gap-4 shadow-2xl z-[120]">
                    {/* Tool Switches */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
                        <button
                            className={`p-2 rounded-full transition-colors ${currentTool === 'pin' ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            onClick={() => setCurrentTool('pin')}
                            title={t('point_pin', "Point Pin")}
                        >
                            <MapPin size={18} />
                        </button>
                        <button
                            className={`p-2 rounded-full transition-colors ${currentTool === 'arrow' ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            onClick={() => setCurrentTool('arrow')}
                            title={t('draw_arrow_drag', "Draw Arrow (Drag)")}
                        >
                            <MousePointer2 size={18} className="rotate-180" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-[var(--glass-border)]"></div>

                    {/* Toggle Sidebar */}
                    <button
                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${showSidebar ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                        onClick={() => setShowSidebar(!showSidebar)}
                        title={t('toggle_notes_panel', "Toggle Notes Panel")}
                    >
                        <MessageSquare size={18} />
                    </button>

                    <div className="w-px h-6 bg-[var(--glass-border)]"></div>


                    {/* Color Picker Swatches */}
                    <div className="flex items-center gap-2 pr-2">
                        {COLORS.map(c => (
                            <button
                                key={c.id}
                                className={`w-6 h-6 rounded-full transition-all ${selectedColor === c.hex ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                style={{ backgroundColor: c.hex }}
                                onClick={() => setSelectedColor(c.hex)}
                                title={`${t('set_color', 'Set color')}: ${c.id}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Notes Area */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="bg-[var(--bg-secondary)] border-l border-[var(--glass-border)] flex flex-col h-full shadow-2xl z-50 overflow-hidden flex-shrink-0"
                    >
                        <div className="w-[380px] h-full flex flex-col">
                            <div className="p-5 border-b border-[var(--glass-border)] flex flex-col gap-1 bg-[var(--bg-secondary)] z-10 sticky top-0">
                                <h3 className="font-semibold text-[var(--text-primary)] text-lg line-clamp-1">{asset.name}</h3>
                                <span className="text-xs text-[var(--text-secondary)]">{t('click_anywhere_drop_pin', 'Click anywhere on the image to drop a pin.')}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {asset.annotations?.length > 0 ? (
                                    asset.annotations.map((ann, idx) => (
                                        <div
                                            key={ann.id}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer dashboard-module group relative
                                    ${hoveredPin === ann.id ? 'border-accent-cyan bg-[var(--hover-bg)] shadow-lg' : 'border-[var(--glass-border)] bg-[var(--bg-secondary)]'}
                                `}
                                            onMouseEnter={() => setHoveredPin(ann.id)}
                                            onMouseLeave={() => setHoveredPin(null)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${ann.status === 'resolved' ? 'border border-green-600' : 'text-black'}`}
                                                        style={{ backgroundColor: ann.status === 'resolved' ? '#22c55e' : (ann.color || '#00f0ff') }}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-[var(--text-primary)]">{ann.author}</span>
                                                        {ann.type === 'arrow' && <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">{t('arrow_annotation', 'Arrow Annotation')}</span>}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] leading-snug pl-7">{ann.text}</p>

                                            {ann.status === 'open' && (
                                                <div className="pl-7 mt-3 hidden group-hover:block transition-opacity">
                                                    <button
                                                        onClick={() => handleResolve(ann.id)}
                                                        className="flex items-center gap-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-xs px-2 py-1.5 rounded-md transition-colors"
                                                    >
                                                        <CheckCircle size={12} /> {t('resolve_note', 'Resolve Note')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] opacity-50 space-y-3 pb-20">
                                        <span className="text-5xl font-light">#</span>
                                        <span className="text-sm text-center px-8">{t('no_annotations_yet', 'No annotations yet.')}<br />{t('click_start_collaborating', 'Click the image to start collaborating.')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ImageAnnotator;
