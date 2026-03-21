import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();

        // Basic validation
        if (!data.message) {
            return NextResponse.json({ success: false, error: "Message requis" }, { status: 400 });
        }

        const newRequest = await Request.create(data);

        return NextResponse.json({ success: true, message: "Demande envoyée", id: newRequest._id });
    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        await dbConnect();
        const requests = await Request.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
