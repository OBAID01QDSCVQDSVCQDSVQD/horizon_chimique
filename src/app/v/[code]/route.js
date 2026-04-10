import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';

/**
 * Short URL redirect: /v/[code] → /verify/[verificationToken]
 * Used to shorten SMS links and save characters.
 */
export async function GET(req, { params }) {
    const { code } = params;

    if (!code) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    try {
        await dbConnect();
        const chantier = await Chantier.findOne({ shortCode: code }).select('verificationToken tokenExpiresAt');

        if (!chantier || !chantier.verificationToken) {
            return NextResponse.redirect(new URL('/?error=lien-invalide', req.url));
        }

        // Check expiry
        if (chantier.tokenExpiresAt && new Date() > chantier.tokenExpiresAt) {
            return NextResponse.redirect(new URL('/?error=lien-expire', req.url));
        }

        const baseUrl = new URL(req.url).origin;
        return NextResponse.redirect(new URL(`/verify/${chantier.verificationToken}`, baseUrl));

    } catch (error) {
        console.error('Short URL redirect error:', error);
        return NextResponse.redirect(new URL('/', req.url));
    }
}
