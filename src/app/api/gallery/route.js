import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryMedia from '@/models/GalleryMedia';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // If not admin, only fetch published media
        let query = {};
        if (!session || session.user.role !== 'admin') {
            query.is_published = true;
        }

        const media = await GalleryMedia.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: media });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { type, url, images, title, description, category, is_published } = body;

        if (!title || !category) {
            return NextResponse.json({ success: false, error: 'Champs obligatoires manquants (titre, catégorie)' }, { status: 400 });
        }

        if (type === 'video' && !url) {
            return NextResponse.json({ success: false, error: 'Une URL est requise pour la vidéo' }, { status: 400 });
        }

        if (type === 'image' && (!images || images.length === 0) && !url) {
            return NextResponse.json({ success: false, error: 'Au moins une image est requise' }, { status: 400 });
        }

        const newMedia = await GalleryMedia.create({
            type,
            url,
            images: images || [],
            title,
            description,
            category,
            is_published: is_published !== undefined ? is_published : true
        });

        return NextResponse.json({ success: true, data: newMedia }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
