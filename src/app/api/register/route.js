import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import admin from '@/lib/firebase-admin';

export async function POST(req) {
    try {
        const { name, identifier, email: reqEmail, phone: reqPhone, password, role, specialty, firebaseToken } = await req.json();

        // Basic Validation
        if (!name || (!identifier && !firebaseToken && !reqPhone) || (role === 'artisan' && !password)) {
            return NextResponse.json({ success: false, error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
        }

        await dbConnect();

        let phone = reqPhone || '';
        let email = reqEmail || '';

        // If it's a client with Firebase Token
        if (role === 'client' && firebaseToken) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
                phone = decodedToken.phone_number;
            } catch (error) {
                return NextResponse.json({ success: false, error: "Token de vérification invalide." }, { status: 401 });
            }
        } else if (identifier) {
            // Legacy/Artisan with single identifier field
            const isEmail = identifier.includes('@');
            if (isEmail) {
                if (!email) email = identifier.toLowerCase();
            } else {
                if (!phone) phone = identifier;
            }
        }

        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        });

        if (existingUser) {
            const conflictType = existingUser.email === email ? 'email' : 'numéro de téléphone';
            return NextResponse.json({
                success: false,
                error: `Ce ${conflictType} est déjà utilisé par un autre compte.`
            }, { status: 400 });
        }

        // Handle Password
        let finalPassword = password;
        if (role === 'client' && firebaseToken && !password) {
            // Generate a random password for SMS users (they log in via OTP)
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
