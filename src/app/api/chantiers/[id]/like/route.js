import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        const userId = session.user.id;

        const chantier = await Chantier.findById(id);
        if (!chantier) {
            return NextResponse.json({ error: "Chantier non trouvé" }, { status: 404 });
        }

        // Ensure likes array exists
        if (!chantier.likes) chantier.likes = [];

        const isLiked = chantier.likes.includes(userId);
        if (isLiked) {
            chantier.likes.pull(userId);
        } else {
            chantier.likes.push(userId);
        }

        await chantier.save();

        return NextResponse.json({
            success: true,
            likesCount: chantier.likes.length,
            isLiked: !isLiked
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
