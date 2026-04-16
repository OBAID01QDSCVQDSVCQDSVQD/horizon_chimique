import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export async function GET() {
    try {
        await dbConnect();
        
        // Always try to find the FIRST settings document
        let setting = await Setting.findOne({}).lean();
        
        if (!setting) {
            // Create a default one if none exists
            const newSetting = await Setting.create({});
            setting = newSetting.toObject();
        }

        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ success: false, error: "Impossible de charger les paramètres" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Safely extract updateable fields
        const { _id, __v, createdAt, updatedAt, ...updateData } = body;

        // Atomic update: Direct and safe
        const setting = await Setting.findOneAndUpdate(
            {},
            { $set: updateData },
            { 
                new: true, 
                upsert: true, 
                runValidators: false 
            }
        );

        console.log('✅ Settings saved successfully');
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('❌ Settings Save Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Erreur lors de la sauvegarde" 
        }, { status: 400 });
    }
}
