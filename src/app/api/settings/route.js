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

        // 1. Find the target document
        let setting = await Setting.findOne({});
        
        if (!setting) {
            setting = new Setting({});
        }

        // 2. Safely extract updateable fields
        const { _id, __v, createdAt, updatedAt, ...updateData } = body;

        // 3. Apply updates manually to ensure nested objects are handled correctly
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                setting[key] = updateData[key];
            }
        });

        // 4. Save with versioning check
        const savedSetting = await setting.save();

        console.log('✅ Settings saved successfully via manual save');
        return NextResponse.json({ success: true, data: savedSetting });
    } catch (error) {
        console.error('❌ CRITICAL Settings Save Error:', error);
        
        // If it's a validation error, provide more detail
        const errorMessage = error.name === 'ValidationError' 
            ? Object.values(error.errors).map(err => err.message).join(', ')
            : (error.message || "Erreur inconnue lors de la sauvegarde");

        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 400 });
    }
}
