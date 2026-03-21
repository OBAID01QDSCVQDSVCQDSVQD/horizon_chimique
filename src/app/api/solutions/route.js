import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    await dbConnect();
    const solutions = await Solution.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: solutions });
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const solution = await Solution.create(body);
        return NextResponse.json({ success: true, data: solution });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
