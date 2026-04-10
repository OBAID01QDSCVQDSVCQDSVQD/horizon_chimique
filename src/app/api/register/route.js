import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, identifier, email: reqEmail, phone: reqPhone, password, role, specialty, otp } = body;

        // Basic Validation
        if (!name || (!identifier && !reqPhone) || (role === 'artisan' && !password)) {
            return NextResponse.json({ success: false, error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
        }

        await dbConnect();

        let phone = reqPhone || identifier || '';
        let email = reqEmail || '';

        // Verification for Client role (WinSMS OTP)
        if (role === 'client' && otp) {
            // Verify OTP
            const otpRecord = await OTP.findOne({ phone, code: otp });
            if (!otpRecord) {
                return NextResponse.json({ success: false, error: "Code de vérification incorrect ou expiré." }, { status: 401 });
            }
            if (otpRecord.expiresAt < new Date()) {
                return NextResponse.json({ success: false, error: "Code de vérification expiré." }, { status: 401 });
            }
            
            // Success, delete OTP
            await OTP.deleteMany({ phone });
        } else if (role === 'artisan' && !password) {
             return NextResponse.json({ success: false, error: "Mot de passe requis pour les artisans." }, { status: 400 });
        }

        // Check for existing user
        const existingQuery = [];
        if (email) existingQuery.push({ email });
        if (phone) existingQuery.push({ phone });
        
        if (existingQuery.length > 0) {
            const existingUser = await User.findOne({ $or: existingQuery });
            if (existingUser) {
                const conflictType = existingUser.email === email ? 'email' : 'numéro de téléphone';
                return NextResponse.json({
                    success: false,
                    error: `Ce ${conflictType} est déjà utilisé par un autre compte.`
                }, { status: 400 });
            }
        }

        // Handle Password
        let finalPassword = password;
        if (role === 'client' && !password) {
            // Generate random password for OTP users
            finalPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        }

        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        const userData = {
            name,
            password: hashedPassword,
            role: role || 'client',
            status: (role === 'artisan') ? 'pending' : 'approved',
        };

        if (email) userData.email = email;
        if (phone) userData.phone = phone;

        if (role === 'artisan') {
            userData.specialty = specialty || 'Général';
        }

        await User.create(userData);

        return NextResponse.json({
            success: true,
            message: role === 'artisan'
                ? "Compte créé ! En attente de validation par l'administrateur."
                : "Compte créé avec succès !"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ success: false, error: "Erreur lors de l'inscription." }, { status: 500 });
    }
}
