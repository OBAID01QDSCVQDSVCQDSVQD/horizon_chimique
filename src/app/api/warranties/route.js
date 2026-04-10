import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Warranty from '@/models/Warranty';
import Chantier from '@/models/Chantier';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        let query = {};
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (session.user.role === 'artisan') {
            query.artisan = session.user.id;
            if (id) {
                query._id = id;
            }
        } else if (session.user.role === 'admin') {
            if (id) {
                query._id = id;
            }
        } else {
            return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });
        }

        const warranties = await Warranty.find(query)
            .populate('chantier', 'clientName clientPhone address surface_sol lineaire_acrotere surface_murs support_type products')
            .populate({
                path: 'artisan',
                select: 'name email companyName address phone image taxId parentGoldArtisan cachet',
                populate: {
                    path: 'parentGoldArtisan',
                    select: 'name email companyName address phone image taxId cachet'
                }
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: warranties });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { chantierId, duration, maintenanceVisits, startDate } = body;

        const chantier = await Chantier.findOne({ _id: chantierId, artisan: session.user.id });
        if (!chantier) {
            return NextResponse.json({ success: false, error: 'Chantier introuvable ou ne vous appartient pas' }, { status: 404 });
        }

        const existing = await Warranty.findOne({ chantier: chantierId });
        if (existing) {
            return NextResponse.json({ success: false, error: 'Une demande de garantie existe déjà pour ce chantier' }, { status: 400 });
        }

        const warranty = await Warranty.create({
            artisan: session.user.id,
            chantier: chantierId,
            clientName: chantier.clientName,
            clientPhone: chantier.clientPhone,
            startDate: startDate || new Date(),
            duration,
            maintenanceVisits: maintenanceVisits ? maintenanceVisits.map(d => ({ date: d, status: 'pending' })) : [],
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: warranty });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
        }

        const body = await req.json();
        const { id, status, contractNumber, coverageDetails, adminNotes, startDate, maintenanceVisits } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });

        const updated = await Warranty.findByIdAndUpdate(id, {
            status,
            contractNumber,
            coverageDetails,
            adminNotes,
            startDate,
            maintenanceVisits
        }, { new: true });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 });

        await Warranty.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
