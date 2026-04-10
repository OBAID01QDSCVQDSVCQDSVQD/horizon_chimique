import { NextResponse } from 'next/server';
import { runWithMongoRetry } from '@/lib/db';
import OTP from '@/models/OTP';
import { sendSMS } from '@/lib/winsms';

export async function POST(req) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    
    console.log(`\n================================`);
    console.log(`🔑 CODE OTP (POUR TEST) : ${code}`);
    console.log(`================================\n`);

    await runWithMongoRetry(async () => {
      await OTP.deleteMany({ phone });
      await OTP.create({ phone, code, expiresAt });
    });

    const message = `Votre code de vérification Horizon Chimique est : ${code}. Valide pendant 5 minutes.`;
    const result = await sendSMS(phone, message);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Code envoyé' });
    }

    // SMS échoué : ne pas laisser un OTP orphelin (l'utilisateur ne reçoit pas le code)
    try {
      await runWithMongoRetry(async () => {
        await OTP.deleteMany({ phone });
      });
    } catch (e) {
      console.error('OTP cleanup after SMS failure:', e);
    }

    console.error('WinSMS Error in route:', result.error);
    const detail = result.error || 'Erreur lors de l\'envoi du SMS';
    return NextResponse.json(
      { error: detail, hint: 'Vérifiez WIN_SMS_API_KEY, le solde WinSMS et le format du numéro (+216…).' },
      { status: 502 }
    );
  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
