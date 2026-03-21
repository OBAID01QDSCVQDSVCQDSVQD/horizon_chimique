import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';
import User from '@/models/User';

import crypto from 'crypto';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'artisan') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();
        const { clientName, clientPhone, products, invoiceImage, surface_sol, lineaire_acrotere, surface_murs, support_type } = data;

        // Backend Validation
        if (!clientName || !clientPhone || !invoiceImage) {
            return NextResponse.json({ success: false, error: "Tous les champs sont requis." }, { status: 400 });
        }

        // Sanitize products to ensure consistent object format (handling potential legacy strings)
        const formattedProducts = Array.isArray(products)
            ? products.map(p => typeof p === 'string' ? { designation: p, quantity: 1 } : p)
            : [];

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        await dbConnect();

        const newChantier = await Chantier.create({
            artisan: session.user.id,
            clientName,
            clientPhone,
            products: formattedProducts,
            invoiceImage,
            surface_sol,
            lineaire_acrotere,
            surface_murs,
            support_type,
            verificationToken,
            tokenExpiresAt
        });

        // Generate WhatsApp Link
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const host = req.headers.get('host');
        const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXTAUTH_URL || "https://horizon-chimique.fly.dev");
        const verificationUrl = `${baseUrl}/verify/${verificationToken}`;
        const artisanName = session.user.name || "votre artisan";
        const message = `Bonjour ${clientName}, c'est votre artisan ${artisanName}. Je viens de déclarer votre chantier sur la plateforme HORIZON CHIMIQUE. Veuillez vérifier les détails et confirmer la qualité sur ce lien (Valide 24h) : ${verificationUrl}`;
        const whatsappLink = `https://wa.me/${clientPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;

        return NextResponse.json({
            success: true,
            message: "Chantier déclaré ! Redirection WhatsApp...",
            chantier: newChantier,
            whatsappLink
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
