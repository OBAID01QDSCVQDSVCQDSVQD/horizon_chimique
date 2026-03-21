import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Security Check
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const setupKey = process.env.ADMIN_SETUP_KEY;

        if (!setupKey || key !== setupKey) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing setup key.' }, { status: 401 });
        }

        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@horizon.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const existing = await User.findOne({ email });
        if (existing) {
            existing.role = 'admin';
            existing.status = 'approved';
            existing.password = hashedPassword;
            await existing.save();
            return NextResponse.json({ success: true, message: `Compte Admin (${email}) mis à jour avec succès !` });
        } else {
            await User.create({
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'admin',
                status: 'approved',
                phone: '99999999' // Changed to avoid collision
            });
            return NextResponse.json({ success: true, message: `Compte Admin (${email}) créé avec succès !` });
        }
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
