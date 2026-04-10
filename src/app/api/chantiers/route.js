import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';
import User from '@/models/User';
import { WinSMS } from '@/lib/sms';

import crypto from 'crypto';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'artisan') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();
        const { clientName, clientPhone, address, products, invoiceImage, surface_sol, lineaire_acrotere, surface_murs, support_type } = data;

        // Backend Validation
        if (!clientName || !clientPhone) {
            return NextResponse.json({ success: false, error: "Nom et téléphone du client sont requis." }, { status: 400 });
        }

        // Sanitize products to ensure consistent object format (handling potential legacy strings)
        const formattedProducts = Array.isArray(products)
            ? products.map(p => typeof p === 'string' ? { designation: p, quantity: 1 } : p)
            : [];

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        // Generate 6-char short code for SMS URL shortener
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars (0,O,1,I)
        let shortCode = '';
        for (let i = 0; i < 6; i++) {
            shortCode += chars[Math.floor(Math.random() * chars.length)];
        }

        await dbConnect();

        const newChantier = await Chantier.create({
            artisan: session.user.id,
            clientName,
            clientPhone,
            address,
            products: formattedProducts,
            invoiceImage,
            surface_sol,
            lineaire_acrotere,
            surface_murs,
            support_type,
            verificationToken,
            tokenExpiresAt,
            shortCode
        });

        // Build SMS with product list
        // Use APP_PUBLIC_URL (production domain) for SMS links - separate from NEXTAUTH_URL which can be localhost
        const baseUrl = (process.env.APP_PUBLIC_URL || process.env.NEXTAUTH_URL || 'https://sdkbatiment.com').replace(/\/$/, '');
        const verificationUrl = `${baseUrl}/verify/${verificationToken}`;

        // Short names to save characters
        const firstName = (clientName || '').split(' ')[0];
        const artisanFirstName = (session.user.name || 'Votre artisan').split(' ')[0];

        // Build products line: "Horietanche x10, HPE x3, Horiflex x2"
        let produitsLine = '';
        if (formattedProducts.length > 0) {
            produitsLine = formattedProducts
                .map(p => `${p.designation} x${p.quantity}`)
                .join(', ');
        }

        // Build full SMS message
        // Format:
        // "Bonjour Ahmed, [Artisan] (SDK Batiment) a declare votre chantier avec les produits suivants:
        // Horietanche x10, HPE x3, Horiflex x2
        // Les quantites sont-elles correctes? Confirmez ici (24h): https://..."
        let smsMessage;
        if (produitsLine) {
            smsMessage = `Bonjour ${firstName}, ${artisanFirstName} (SDK Batiment) a declare votre chantier avec: ${produitsLine}. Les quantites sont-elles correctes? Confirmez (24h): ${verificationUrl}`;
        } else {
            smsMessage = `Bonjour ${firstName}, ${artisanFirstName} (SDK Batiment) a declare votre chantier. Confirmez (24h): ${verificationUrl}`;
        }

        // Safety fallback if extremely long (e.g. many products): cap at 4 SMS segments = 612 chars
        if (smsMessage.length > 612) {
            const shortProducts = formattedProducts.slice(0, 3).map(p => `${p.designation} x${p.quantity}`).join(', ');
            smsMessage = `Bonjour ${firstName}, ${artisanFirstName} (SDK Batiment) a declare votre chantier. Produits: ${shortProducts}... Confirmez (24h): ${verificationUrl}`;
        }

        // Send SMS via WinSMS
        let smsStatus = { sent: false, error: null };
        try {
            const smsResult = await WinSMS.sendSMS(clientPhone, smsMessage);
            smsStatus = { sent: smsResult.success, error: smsResult.error || null };
            if (!smsResult.success) {
                console.error(`SMS failed for chantier ${newChantier._id}:`, smsResult.error);
            }
        } catch (smsErr) {
            console.error('SMS send exception:', smsErr);
            smsStatus = { sent: false, error: 'Exception lors de l\'envoi SMS' };
        }

        return NextResponse.json({
            success: true,
            message: smsStatus.sent
                ? "Chantier déclaré ! SMS envoyé au client."
                : `Chantier déclaré ! (SMS non envoyé: ${smsStatus.error})`,
            chantier: newChantier,
            smsStatus
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        await dbConnect();

        let chantiers;

        if (session.user.role === 'admin') {
            // Admin sees all chantiers, sorted by newest
            chantiers = await Chantier.find({})
                .populate('artisan', 'name email phone identifier')
                .sort({ createdAt: -1 });
        } else {
            // Artisan sees only their own
            chantiers = await Chantier.find({ artisan: session.user.id })
                .sort({ createdAt: -1 });
        }

        return NextResponse.json({ success: true, chantiers });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
