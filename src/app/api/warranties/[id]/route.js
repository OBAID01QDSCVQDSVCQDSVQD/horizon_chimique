import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Warranty from '@/models/Warranty';
import Chantier from '@/models/Chantier';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = params;

        const warranty = await Warranty.findOne({ _id: id, artisan: session.user.id })
            .populate('chantier');

        if (!warranty) {
            return NextResponse.json({ success: false, error: 'Garantie introuvable' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: warranty });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();

        const {
            // General Warranty details
            startDate, duration, maintenanceVisits,
            // Chantier Details
            clientName, clientPhone, address, products, surface_sol, lineaire_acrotere, surface_murs, support_type
        } = body;

        const warranty = await Warranty.findOne({ _id: id, artisan: session.user.id });
        if (!warranty) {
            return NextResponse.json({ success: false, error: 'Garantie introuvable' }, { status: 404 });
        }

        // 1. Update Chantier
        const chantier = await Chantier.findById(warranty.chantier);
        if (chantier) {
            if (clientName) chantier.clientName = clientName;
            if (clientPhone) chantier.clientPhone = clientPhone;
            if (address !== undefined) chantier.address = address;
            if (products) chantier.products = products;
            if (surface_sol !== undefined) chantier.surface_sol = surface_sol || 0;
            if (lineaire_acrotere !== undefined) chantier.lineaire_acrotere = lineaire_acrotere || 0;
            if (surface_murs !== undefined) chantier.surface_murs = surface_murs || 0;
            if (support_type) chantier.support_type = support_type;

            await chantier.save();
        }

        // 2. Update Warranty details
        if (clientName) warranty.clientName = clientName;
        if (clientPhone) warranty.clientPhone = clientPhone;
        if (startDate) warranty.startDate = startDate;
        if (duration) warranty.duration = duration;
        if (maintenanceVisits) warranty.maintenanceVisits = maintenanceVisits;

        // Reset status to pending so admin re-validates if artisan edits? Actually, usually editing resets status unless admin approved. Let's keep it simple and just update data context.
        // warranty.status = 'pending'; // Optional: if editing resets approval 

        await warranty.save();

        return NextResponse.json({ success: true, message: 'Garantie mise à jour', data: warranty });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
