import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Veuillez fournir une adresse email' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Check dummy text to prevent User Enumeration
            return NextResponse.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
        }

        // Generate Token
        // using randomBytes for the token sent to user
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash it before saving to DB
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save to User (expires in 1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create Reset URL
        let baseUrl;
        const host = request.headers.get('host');

        if (host) {
            // Determine protocol: check X-Forwarded-Proto first (for proxies/Vercel), else guess based on localhost
            const forwardedProto = request.headers.get('x-forwarded-proto');
            const protocol = forwardedProto ? forwardedProto : (host.includes('localhost') ? 'http' : 'https');
            baseUrl = `${protocol}://${host}`;
        } else {
            // Fallback
            baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        }

        const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

        // Send Email
        const message = `
            <h1>Demande de réinitialisation de mot de passe</h1>
            <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte Horizon Chimique.</p>
            <p>Veuillez cliquer sur le lien ci-dessous pour changer votre mot de passe :</p>
            <a href="${resetUrl}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Réinitialiser mon mot de passe</a>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>
        `;

        const result = await sendEmail(
            user.email,
            'Réinitialisation du mot de passe - Horizon Chimique',
            `Lien de réinitialisation : ${resetUrl}`,
            message
        );

        if (!result.success) {
            // Cleanup on error
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return NextResponse.json({ success: false, error: 'Erreur lors de l\'envoi de l\'email.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Email envoyé avec succès.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 });
    }
}
