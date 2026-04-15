import { ImageResponse } from 'next/og';
import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import '@/models/User'; // Ensure User model is loaded for populate

export const runtime = 'nodejs';

export const alt = 'Réalisation SDK Batiment';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const project = await (Realization as any).findById(params.id)
      .populate('artisan', 'companyName name')
      .lean();

    if (!project) {
      return new ImageResponse(
        (
          <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64, fontWeight: 'bold' }}>
            SDK Batiment
          </div>
        ),
        { ...size }
      );
    }

    const artisanName = (project.artisan as any)?.companyName || (project.artisan as any)?.name || 'Artisan Partenaire';
    const mainImage = project.images && project.images[0] ? project.images[0] : null;

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Background Decorative Circles */}
          <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: '#10b981', opacity: 0.05, display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: '#10b981', opacity: 0.08, display: 'flex' }} />

          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 50, left: 60 }}>
            <div style={{ width: 12, height: 40, background: '#10b981', borderRadius: 4, marginRight: 15, display: 'flex' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '2px' }}>SDK BATIMENT</span>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981' }}>CHANTIER RÉALISÉ</span>
            </div>
          </div>

          {/* Project Layout */}
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', marginTop: 40 }}>
            
            {/* Left Side: Project Main Image */}
            <div style={{ display: 'flex', width: '50%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div style={{ 
                display: 'flex',
                padding: '12px',
                background: '#fff',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={project.title}
                    width={450}
                    height={450}
                    style={{
                      objectFit: 'cover',
                      borderRadius: '16px',
                    }}
                  />
                ) : (
                  <div style={{ width: 450, height: 450, background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, color: '#94a3b8' }}>
                    🏗️
                  </div>
                )}
                  
                {/* Play Button Overlay if video exists */}
                {project.video && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 120,
                    height: 120,
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid #fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderTop: '25px solid transparent',
                      borderBottom: '25px solid transparent',
                      borderLeft: '40px solid #fff',
                      marginLeft: '10px',
                      display: 'flex'
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '50%', paddingLeft: 60 }}>
              {/* Tag / Category Badge */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {project.tags && project.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} style={{ 
                    fontSize: 16, 
                    fontWeight: 800, 
                    background: '#f1f5f9', 
                    color: '#64748b', 
                    padding: '6px 14px', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              <div style={{ 
                fontSize: 48, 
                fontWeight: 900, 
                color: '#0f172a', 
                lineHeight: 1.1, 
                marginBottom: 20,
                display: 'flex'
              }}>
                {project.title?.substring(0, 40) || 'Réalisation'}
              </div>

              {/* Artisan Info Box */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '16px',
                border: '2px solid #e2e8f0'
              }}>
                <span style={{ fontSize: 16, color: '#64748b', fontWeight: 'bold', marginBottom: 5 }}>ARTISAN PARTENAIRE :</span>
                <span style={{ fontSize: 24, color: '#0f172a', fontWeight: 800 }}>{artisanName}</span>
              </div>

              {/* Social Proof Mini Bar */}
              <div style={{ display: 'flex', marginTop: 30, alignItems: 'center', gap: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#ecfdf5', color: '#059669', padding: '8px 16px', borderRadius: '100px' }}>
                  <span style={{ fontSize: 18, fontWeight: 900 }}>✓ TRAVAIL GARANTI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: 40, right: 60, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 600 }}>Découvrez plus sur sdkbatiment.com</span>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    // Return a simple branded fallback that never crashes
    return new ImageResponse(
      (
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 20, display: 'flex' }}>SDK BATIMENT</div>
          <div style={{ fontSize: 28, color: '#10b981', fontWeight: 700, display: 'flex' }}>Découvrez nos réalisations</div>
        </div>
      ),
      { ...size }
    );
  }
}
