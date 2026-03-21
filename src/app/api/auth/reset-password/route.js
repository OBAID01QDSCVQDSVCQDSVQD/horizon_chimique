import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await dbConnect();
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ success: false, error: 'Token ou mot de passe manquant.' }, { status: 400 });
        }

        // Hash the provided token to compare with DB
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() } // Check if not expired
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Lien invalide ou expiré.' }, { status: 400 });
        }

        // Update Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear Reset Fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 });
    }
}
