import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        const data = await req.json();

        await dbConnect();
        const campaign = await Campaign.findByIdAndUpdate(id, data, { new: true });

        if (!campaign) {
            return NextResponse.json({ success: false, error: "Campagne introuvable" }, { status: 404 });
        }

        return NextResponse.json({ success: true, campaign });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        await dbConnect();
        const campaign = await Campaign.findByIdAndDelete(id);

        if (!campaign) {
            return NextResponse.json({ success: false, error: "Campagne introuvable" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
