import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export async function GET() {
    try {
        await dbConnect();
        // Fetch the existing setting or create default if not exists
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({});
        }
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const setting = await Setting.findOneAndUpdate({}, body, { new: true, upsert: true });
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
