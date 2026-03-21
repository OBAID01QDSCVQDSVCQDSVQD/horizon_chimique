import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Setting from '@/models/Setting'; // Import Setting Model
import { renderToStream } from '@react-pdf/renderer';
import { ProductPdf } from '@/components/pdf/ProductPdf';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        // Fetch Company Settings
        // Use lean() for faster read if possible, but findOne is fine
        // If no settings exist yet, we rely on the helper or default
        let settings = await Setting.findOne();
        if (!settings) {
            settings = {
                companyName: 'HORIZON CHIMIQUE',
                subtitle: 'Solutions Techniques & Bâtiment',
                address: 'ZI. Oued Ellil, Manouba - Tunisie',
                phone: '+216 71 608 000',
                email: 'contact@horizon-chimique.tn',
                website: 'www.horizon-chimique.tn'
            };
        }

        // Determine Logo URL
        // If user uploaded a logo (cloudinary url), use it directly
        // If not, check local public folder as fallback
        let logoUrl = null;
        if (settings.logoUrl) {
            logoUrl = settings.logoUrl;
        } else {
            // Fallback to local default logo
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                logoUrl = logoPath;
            }
        }

        // Render PDF with settings
        const stream = await renderToStream(<ProductPdf product={product} logoUrl={logoUrl} companyInfo={settings} />);

        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const filename = `Fiche_Technique_${product.designation.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
