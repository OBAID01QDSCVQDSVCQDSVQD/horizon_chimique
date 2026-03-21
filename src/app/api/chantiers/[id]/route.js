import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';
import User from '@/models/User';

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        const { status, points, notes } = await req.json(); // points to award

        await dbConnect();

        const chantier = await Chantier.findById(id);
        if (!chantier) {
            return NextResponse.json({ success: false, error: "Chantier non trouvé" }, { status: 404 });
        }

        // Prevent double points if already approved
        if (chantier.status === 'approved' && status === 'approved') {
            return NextResponse.json({ success: false, error: "Ce chantier est déjà validé." }, { status: 400 });
        }

        // Logic
        chantier.status = status;
        if (notes) chantier.notes = notes;

        if (status === 'approved') {
            const pointsToAward = Number(points) || 0;
            chantier.pointsEarned = pointsToAward;

            // Update User Points
            await User.findByIdAndUpdate(chantier.artisan, {
                $inc: { points: pointsToAward }
            });
        }

        await chantier.save();

        return NextResponse.json({ success: true, message: "Mise à jour effectuée", chantier });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
