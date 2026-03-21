import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        await dbConnect();

        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }

        return NextResponse.json({
            success: true,
            fidelity: settings.fidelity || { bronze: 1.0, silver: 1.2, gold: 1.5 }
        });
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

        const body = await req.json();
        const { bronze, silver, gold } = body;

        await dbConnect();

        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }

        settings.fidelity = {
            bronze: parseFloat(bronze) || 1.0,
            silver: parseFloat(silver) || 1.2,
            gold: parseFloat(gold) || 1.5
        };

        await settings.save();

        return NextResponse.json({
            success: true,
            fidelity: settings.fidelity
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
