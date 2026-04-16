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

        // 🛡️ SECURITY & STABILITY: Carefully select fields to update
        // This prevents Mongoose from trying to overwrite immutable or internal fields
        const { _id, __v, createdAt, updatedAt, ...updateData } = body;

        // Perform the update
        // We use $set to only update the fields provided, preserving others
        const setting = await Setting.findOneAndUpdate(
            {},
            { $set: updateData },
            { 
                new: true, 
                upsert: true, 
                runValidators: false, // Turn off validators to avoid strict schema match issues during transition
                setDefaultsOnInsert: true 
            }
        );

        console.log('✅ Settings updated successfully');
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('❌ Settings PUT error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Erreur interne du serveur lors de la sauvegarde" 
        }, { status: 400 });
    }
}
