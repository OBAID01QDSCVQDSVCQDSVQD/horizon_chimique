'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectGalleryFB({ images }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const openLightbox = (i) => setLightboxIndex(i);
    const closeLightbox = () => setLightboxIndex(null);

    useEffect(() => {
        const onKey = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') setLightboxIndex(p => (p - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') setLightboxIndex(p => (p + 1) % images.length);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, images]);

    if (!images || images.length === 0) return null;

    const count = images.length;
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
        background: '#3a3b3c',
    };

    // 1 image
    if (count === 1) {
        return (
            <>
                <div style={{ ...cellBase, width: '100%', maxHeight: 500 }} onClick={() => openLightbox(0)}>
                    <img src={images[0]} alt="Photo 1" style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }} />
                </div>
                <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNext={() => setLightboxIndex(p => (p + 1) % count)} onPrev={() => setLightboxIndex(p => (p - 1 + count) % count)} />
            </>
        );
    }

    // 2 images
    if (count === 2) {
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 360 }}>
                    {images.slice(0, 2).map((img, i) => (
                        <div key={i} style={cellBase} onClick={() => openLightbox(i)}>
                            <img src={img} alt={`Photo ${i + 1}`} style={imgStyle} />
                            <div style={overlayStyle} />
                        </div>
                    ))}
                </div>
                <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNext={() => setLightboxIndex(p => (p + 1) % count)} onPrev={() => setLightboxIndex(p => (p - 1 + count) % count)} />
            </>
        );
    }

    // 3 images
    if (count === 3) {
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 400 }}>
                    <div style={{ ...cellBase, gridRow: 'span 2' }} onClick={() => openLightbox(0)}>
                        <img src={images[0]} alt="Photo 1" style={imgStyle} />
                        <div style={overlayStyle} />
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} style={{ ...cellBase, height: '199px' }} onClick={() => openLightbox(i)}>
                            <img src={images[i]} alt={`Photo ${i + 1}`} style={imgStyle} />
                            <div style={overlayStyle} />
                        </div>
                    ))}
                </div>
                <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNext={() => setLightboxIndex(p => (p + 1) % count)} onPrev={() => setLightboxIndex(p => (p - 1 + count) % count)} />
            </>
        );
    }

    // 4 images
    if (count === 4) {
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 400 }}>
                    <div style={{ ...cellBase, gridColumn: 'span 2', height: 200 }} onClick={() => openLightbox(0)}>
                        <img src={images[0]} alt="Photo 1" style={imgStyle} />
                        <div style={overlayStyle} />
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ ...cellBase, height: 198 }} onClick={() => openLightbox(i)}>
                            <img src={images[i]} alt={`Photo ${i + 1}`} style={imgStyle} />
                            <div style={overlayStyle} />
                        </div>
                    ))}
                </div>
                <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNext={() => setLightboxIndex(p => (p + 1) % count)} onPrev={() => setLightboxIndex(p => (p - 1 + count) % count)} />
            </>
        );
    }

    // 5+ images (Facebook style: big left + 4 right grid with "+N more" overlay)
    const extraCount = count - 5;
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 420 }}>
                {/* Left big image */}
                <div style={{ ...cellBase, gridRow: 'span 2' }} onClick={() => openLightbox(0)}>
                    <img src={images[0]} alt="Photo 1" style={imgStyle} />
                    <div style={overlayStyle} />
                </div>
                {/* Right 4 small images, last one with +N overlay */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, gridRow: 'span 2' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ ...cellBase, height: 208 }} onClick={() => openLightbox(i)}>
                            <img src={images[i]} alt={`Photo ${i + 1}`} style={imgStyle} />
                            {i === 4 && extraCount > 0 ? (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.55)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 700, fontSize: 24,
                                }}>
                                    +{extraCount}
                                </div>
                            ) : (
                                <div style={overlayStyle} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNext={() => setLightboxIndex(p => (p + 1) % count)} onPrev={() => setLightboxIndex(p => (p - 1 + count) % count)} />
        </>
    );
}

function Lightbox({ images, index, onClose, onNext, onPrev }) {
    if (index === null || !images) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: '50%', cursor: 'pointer',
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', zIndex: 10,
                }}
            >
                <X size={22} />
            </button>

            {/* Image */}
            <div
                style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={images[index]}
                    alt={`Photo ${index + 1}`}
                    style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4, display: 'block' }}
                />
                {/* Counter */}
                <div style={{
                    position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 20,
                    padding: '4px 14px', fontSize: 13, fontWeight: 600,
                }}>
                    {index + 1} / {images.length}
                </div>
            </div>

            {/* Prev */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    style={{
                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                        width: 44, height: 44, cursor: 'pointer', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Next */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    style={{
                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                        width: 44, height: 44, cursor: 'pointer', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
}
