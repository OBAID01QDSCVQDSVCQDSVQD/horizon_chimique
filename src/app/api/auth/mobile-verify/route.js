import { NextResponse } from 'next/server';
import { runWithMongoRetry } from '@/lib/db';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function normalizePhone(p) {
    if (!p || typeof p !== 'string') return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 8 && /^[2459]/.test(digits)) return '216' + digits;
    if (digits.startsWith('216')) return digits;
    if (digits.startsWith('0')) return '216' + digits.slice(1);
    return digits;
}

export async function POST(req) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ error: 'Téléphone et OTP requis' }, { status: 400 });

    await dbConnect();

    // Verify OTP
    const record = await OTP.findOne({ phone, code: otp });
    if (!record) {
        return NextResponse.json({ error: 'Code incorrect ou expiré' }, { status: 401 });
    }
    if (record.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Code expiré' }, { status: 401 });
    }

    const phoneNorm = normalizePhone(phone);
    let user = await User.findOne({ phone });
    
    if (!user && phoneNorm) {
        const allWithPhone = await User.find({ phone: { $exists: true, $ne: '' } }).select('_id phone');
        const match = allWithPhone.find(u => normalizePhone(u.phone) === phoneNorm);
        if (match) user = await User.findById(match._id);
    }

    if (!user) {
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        user = await User.create({
            name: `Utilisateur ${phone.slice(-4)}`,
            phone: phone,
            role: 'client',
            status: 'approved',
            password: dummyPassword
        });
    }

    // Delete OTP once used
    await OTP.deleteMany({ phone });

    if (user.status === 'rejected') return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    if (user.role === 'artisan' && user.status === 'pending') return NextResponse.json({ error: 'Compte en attente de validation' }, { status: 403 });

    // Generate a simple token for mobile
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, phone: user.phone, name: user.name },
      process.env.NEXTAUTH_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        image: user.image,
        companyName: user.companyName,
        phone: user.phone,
        points: user.points || 0,
        fidelityRank: user.fidelityRank || 'Membre',
        specializations: user.specializations || []
      }
    });

  } catch (error) {
    console.error('Mobile Verify Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
