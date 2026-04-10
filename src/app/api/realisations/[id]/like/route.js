import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        let session = await getServerSession(authOptions);
        if (!session) {
            session = await getMobileSession(req);
        }
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        const userId = session.user.id;

        const realization = await Realization.findById(id);
        if (!realization) {
            return NextResponse.json({ error: "Réalisation non trouvée" }, { status: 404 });
        }

        // Ensure likes array exists and is an array (handle migration from Number legacy)
        if (!Array.isArray(realization.likes)) {
            realization.likes = [];
        }

        const isLiked = realization.likes.some(id => id.toString() === userId);
        if (isLiked) {
            // Remove user ID
            realization.likes = realization.likes.filter(id => id.toString() !== userId);
        } else {
            realization.likes.push(userId);
        }

        await realization.save();

        return NextResponse.json({
            success: true,
            likesCount: realization.likes.length,
            isLiked: !isLiked
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
