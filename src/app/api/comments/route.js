import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobileAuth";

// GET Comments
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const realizationId = searchParams.get('realizationId');

        if (!realizationId) {
            return NextResponse.json({ error: "Realization ID requis" }, { status: 400 });
        }

        const comments = await Comment.find({
            realization: realizationId,
            status: 'approved'
        })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST Comment
export async function POST(req) {
    try {
        await dbConnect();
        let session = await getServerSession(authOptions);
        if (!session) {
            session = await getMobileSession(req);
        }
        if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await req.json();
        const { realizationId, content } = body;

        if (!realizationId || !content) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        const comment = await Comment.create({
            realization: realizationId,
            user: session.user.id,
            content,
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: comment, message: "Commentaire en attente de validation" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
