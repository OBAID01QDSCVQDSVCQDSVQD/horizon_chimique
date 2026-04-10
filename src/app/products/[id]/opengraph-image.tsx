
import { ImageResponse } from 'next/og';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const runtime = 'nodejs';

// المقاسات المثالية لفيسبوك وإنستغرام والواتساب
export const alt = 'SDK Batiment Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  await dbConnect();
  const product = await (Product as any).findOne({ _id: params.id }).lean();

  if (!product) {
    return new ImageResponse(
      (
        <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64, fontWeight: 'bold' }}>
          SDK Batiment
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #ffffff, #f1f5f9)',
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
        {/* خلفية جمالية (Decorative elements) */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: '#2563eb', opacity: 0.1 }} />
        <div style={{ position: 'absolute', bottom: -100, left: -50, width: 400, height: 400, borderRadius: '50%', background: '#2563eb', opacity: 0.05 }} />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 50, left: 60 }}>
          <div style={{ width: 12, height: 40, background: '#2563eb', borderRadius: 4, marginRight: 15 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, fontWeight: 'black', color: '#0f172a', letterSpacing: '2px' }}>SDK BATIMENT</span>
            <span style={{ fontSize: 16, fontWeight: 'bold', color: '#2563eb' }}>L'Excellence en Étanchéité</span>
          </div>
        </div>

        {/* Product Layout */}
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', marginTop: 40 }}>
          
          {/* Left Side: Image */}
          <div style={{ display: 'flex', width: '45%', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={product.images && product.images[0] ? product.images[0] : 'https://sdkbatiment.com/logo.png'}
              alt={product.designation}
              style={{
                width: 450,
                height: 450,
                objectFit: 'contain',
                borderRadius: '24px',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
              }}
            />
          </div>

          {/* Right Side: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '55%', paddingLeft: 60 }}>
            <span style={{ 
              fontSize: 20, 
              fontWeight: 800, 
              background: '#2563eb', 
              color: '#fff', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              marginBottom: 15,
              alignSelf: 'flex-start'
            }}>
              {Array.isArray(product.gamme) ? product.gamme[0] : product.gamme}
            </span>
            <h1 style={{ 
              fontSize: 64, 
              fontWeight: 'black', 
              color: '#0f172a', 
              lineHeight: 1.1, 
              marginBottom: 20,
              maxWidth: '100%' 
            }}>
              {product.designation}
            </h1>
            <p style={{ fontSize: 24, color: '#64748b', maxWidth: 500, lineHeight: 1.4 }}>
              {product.description_courte}
            </p>
            
            {/* Features Mini Icons */}
            <div style={{ display: 'flex', marginTop: 30, gap: 20 }}>
               <div style={{ display: 'flex', background: '#f8fafc', padding: '10px 15px', borderRadius: 12, border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#334155' }}>QUALITÉ PREMIUM</span>
               </div>
               <div style={{ display: 'flex', background: '#f8fafc', padding: '10px 15px', borderRadius: 12, border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>MADE IN TUNISIA</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, right: 60, display: 'flex', alignItems: 'center' }}>
           <span style={{ fontSize: 18, color: '#94a3b8' }}>www.sdkbatiment.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
