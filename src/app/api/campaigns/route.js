import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        await dbConnect();
        const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, campaigns });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        // Optional: Ensure only one active campaign per position if needed, 
        // but for now let's allow multiple and frontend picks first/random.

        const campaign = await Campaign.create(data);
        return NextResponse.json({ success: true, campaign });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
