import { NextResponse } from 'next/server';
import { runWithMongoRetry } from '@/lib/db';
import OTP from '@/models/OTP';
import { sendSMS } from '@/lib/winsms';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    // Strict Rate Limit: 2 SMS per minute
    const { success: minOk } = await rateLimit(`otp_min_${ip}`, 2, 60);
    if (!minOk) return NextResponse.json({ error: 'Trop de tentatives. Attendez une minute.' }, { status: 429 });

    // Strict Rate Limit: 10 SMS per hour
    const { success: hrOk } = await rateLimit(`otp_hr_${ip}`, 10, 3600);
    if (!hrOk) return NextResponse.json({ error: 'Limite horaire atteinte pour les SMS.' }, { status: 429 });

    const { phone: rawPhone, turnstileToken } = await req.json();
    if (!rawPhone) return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });

    // Verify Turnstile (Human Check) before sending SMS
    const { verifyTurnstile } = await import('@/lib/auth');
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Échec de la vérification Anti-Bot (Captcha). Veuillez réessayer.' }, { status: 403 });
    }

    // Normalize phone for consistency (216XXXXXXXX)
    const phone = rawPhone.replace(/\D/g, '').length === 8 && /^[2459]/.test(rawPhone.replace(/\D/g, '')) 
        ? '216' + rawPhone.replace(/\D/g, '') 
        : rawPhone.replace(/\D/g, '');

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    
    console.log(`\n================================`);
    console.log(`🔑 CODE OTP (POUR TEST) : ${code} | PHONE: ${phone}`);
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
