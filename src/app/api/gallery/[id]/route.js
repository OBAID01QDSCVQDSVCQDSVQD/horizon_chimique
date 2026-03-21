import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryMedia from '@/models/GalleryMedia';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const media = await GalleryMedia.findById(id);

        if (!media) {
            return NextResponse.json({ success: false, error: 'Média introuvable' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: media });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();

        // Updating any given field, useful for the fast toggle is_published too
        const updatedMedia = await GalleryMedia.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedMedia) {
            return NextResponse.json({ success: false, error: 'Média introuvable' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedMedia });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = params;
        const deletedMedia = await GalleryMedia.findByIdAndDelete(id);

        if (!deletedMedia) {
            return NextResponse.json({ success: false, error: 'Média introuvable' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Supression réussie' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
