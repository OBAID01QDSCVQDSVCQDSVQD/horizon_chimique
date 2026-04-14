import { useState, useEffect } from 'react';
import { X, ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function ProjectGalleryFB({ images = [], video = '' }) {
    const [lightboxIndex, setLightboxIndex] = useState(null); // null, 'video', or index
    
    const media = [...images];
    const hasVideo = !!video;

    const openLightbox = (type) => setLightboxIndex(type);
    const closeLightbox = () => setLightboxIndex(null);

    useEffect(() => {
        const onKey = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && typeof lightboxIndex === 'number') {
                setLightboxIndex(p => (p - 1 + images.length) % images.length);
            }
            if (e.key === 'ArrowRight' && typeof lightboxIndex === 'number') {
                setLightboxIndex(p => (p + 1) % images.length);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, images]);

    if ((!images || images.length === 0) && !video) return null;

    const imgStyle = {
        width: '100%', height: '100%', objectFit: 'cover',
        display: 'block', cursor: 'pointer', transition: 'filter 0.2s',
    };
    const overlayStyle = {
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
        transition: 'background 0.2s',
    };
    const cellBase = {
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#000',
    };

    const VideoCell = ({ isBig = false }) => (
        <div style={{ ...cellBase, width: '100%', height: '100%' }} onClick={() => openLightbox('video')}>
            <video src={video} style={imgStyle} muted />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: isBig ? 64 : 48, height: isBig ? 64 : 48, background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '2px solid #fff' }}>
                    <Play size={isBig ? 32 : 24} fill="currentColor" />
                </div>
            </div>
        </div>
    );

    // Layout Logic based on count of images + video
    const totalCount = images.length + (hasVideo ? 1 : 0);

    // 1 Item (Only Video or Only 1 Image)
    if (totalCount === 1) {
        return (
            <>
                <div style={{ ...cellBase, width: '100%', maxHeight: 500 }}>
                    {hasVideo ? <VideoCell isBig={true} /> : <img src={images[0]} alt="Photo" style={{ ...imgStyle, maxHeight: 500 }} onClick={() => openLightbox(0)} />}
                </div>
                <Lightbox images={images} video={video} index={lightboxIndex} onClose={closeLightbox} setIndex={setLightboxIndex} />
            </>
        );
    }

    // 2 Items
    if (totalCount === 2) {
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 360 }}>
                    {hasVideo && <VideoCell />}
                    {images.slice(0, hasVideo ? 1 : 2).map((img, i) => (
                        <div key={i} style={cellBase} onClick={() => openLightbox(i)}>
                            <img src={img} alt={`Photo`} style={imgStyle} />
                        </div>
                    ))}
                </div>
                <Lightbox images={images} video={video} index={lightboxIndex} onClose={closeLightbox} setIndex={setLightboxIndex} />
            </>
        );
    }

    // 3 Items
    if (totalCount === 3) {
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 400 }}>
                    <div style={{ ...cellBase, gridRow: 'span 2' }}>
                        {hasVideo ? <VideoCell isBig={true} /> : <img src={images[0]} style={imgStyle} onClick={() => openLightbox(0)} />}
                    </div>
                    {images.slice(hasVideo ? 0 : 1, hasVideo ? 2 : 3).map((img, i) => (
                        <div key={i} style={{ ...cellBase, height: '199px' }} onClick={() => openLightbox(hasVideo ? i : i + 1)}>
                            <img src={img} style={imgStyle} />
                        </div>
                    ))}
                </div>
                <Lightbox images={images} video={video} index={lightboxIndex} onClose={closeLightbox} setIndex={setLightboxIndex} />
            </>
        );
    }

    // 4+ Items (Standard FB Grid)
    const extraCount = totalCount - 5;
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 420 }}>
                {/* Left side big element */}
                <div style={{ ...cellBase, gridRow: 'span 2' }}>
                    {hasVideo ? <VideoCell isBig={true} /> : <img src={images[0]} style={imgStyle} onClick={() => openLightbox(0)} />}
                </div>
                {/* Right side 4 small elements grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, gridRow: 'span 2' }}>
                    {images.slice(hasVideo ? 0 : 1, (hasVideo ? 0 : 1) + 4).map((img, i) => {
                        const actualIdx = hasVideo ? i : i + 1;
                        const isLast = i === 3 && extraCount > 0;
                        return (
                            <div key={i} style={{ ...cellBase, height: 208 }} onClick={() => openLightbox(actualIdx)}>
                                <img src={img} style={imgStyle} />
                                {isLast && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24 }}>
                                        +{extraCount}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <Lightbox images={images} video={video} index={lightboxIndex} onClose={closeLightbox} setIndex={setLightboxIndex} />
        </>
    );
}

function Lightbox({ images, video, index, onClose, setIndex }) {
    if (index === null) return null;

    const isVideo = index === 'video';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
            onClick={onClose}
        >
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff' }}>
                <X size={26} />
            </button>

            <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
                {isVideo ? (
                    <video src={video} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
                ) : (
                    <img src={images[index]} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
                )}
                
                {/* Navigation and Counters if multiple images */}
                {!isVideo && images.length > 1 && (
                    <>
                        <button onClick={() => setIndex((index - 1 + images.length) % images.length)} style={{ position: 'absolute', left: -60, top: '50%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={48} /></button>
                        <button onClick={() => setIndex((index + 1) % images.length)} style={{ position: 'absolute', right: -60, top: '50%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight size={48} /></button>
                        <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontWeight: 600 }}>{index + 1} / {images.length}</div>
                    </>
                )}
            </div>
        </div>
    );
}
