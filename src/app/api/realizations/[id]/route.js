import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import { getMobileSession } from "@/lib/mobileAuth";
import redis from '@/lib/redis';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const realization = await Realization.findById(params.id).populate('artisan', 'name image companyName');

        if (!realization) {
            return NextResponse.json({ success: false, error: "Projet non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ success: true, realization });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        let session = await getServerSession(authOptions);
        if (!session) {
            session = await getMobileSession(req);
        }
        if (!session) {
            return NextResponse.json({ success: false, error: "Authentication requise" }, { status: 401 });
        }

        await dbConnect();
        const realization = await Realization.findById(params.id);

        if (!realization) {
            return NextResponse.json({ success: false, error: "Projet non trouvé" }, { status: 404 });
        }

        // Check ownership
        if (realization.artisan.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Action non autorisée" }, { status: 403 });
        }

        const data = await req.json();

        // Update fields
        if (data.title) realization.title = data.title;
        if (data.description) realization.description = data.description;
        if (data.tags) realization.tags = data.tags;
        if (data.images) realization.images = data.images;
        if (data.video !== undefined) realization.video = data.video;
        if (data.location) realization.location = data.location;
        if (data.isVisible !== undefined) realization.isVisible = data.isVisible;

        await realization.save();

        // مسح الـ Cache العام عند تحديث المشروع
        if (redis) {
            try {
                await redis.del('realizations:public');
            } catch (cacheErr) {
                console.error('Redis Cache Clear Error:', cacheErr);
            }
        }

        return NextResponse.json({ success: true, realization });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        let session = await getServerSession(authOptions);
        if (!session) {
            session = await getMobileSession(req);
        }
        if (!session) {
            return NextResponse.json({ success: false, error: "Authentication requise" }, { status: 401 });
        }

        await dbConnect();
        const realization = await Realization.findById(params.id);

        if (!realization) {
            return NextResponse.json({ success: false, error: "Projet non trouvé" }, { status: 404 });
        }

        // Check ownership
        if (realization.artisan.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Action non autorisée" }, { status: 403 });
        }

        await realization.deleteOne();

        return NextResponse.json({ success: true, message: "Projet supprimé" });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
