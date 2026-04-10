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

        // Strip Mongoose internal fields to avoid immutable field errors
        const { _id, __v, createdAt, updatedAt, ...updateData } = body;

        const setting = await Setting.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, runValidators: false }
        );
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('Settings PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
