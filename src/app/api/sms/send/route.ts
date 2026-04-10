import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { WinSMS } from '@/lib/sms';
// Note: using the JS db adapter, but works in TS with allowJs
import dbConnect from '@/lib/db';
import SMSLog from '@/models/SMSLog';

/**
 * Validates a Tunisian phone number format:
 * 8 digits starting with 2, 4, 5, 7, 9
 * OR 11 digits starting with 216 followed by 2, 4, 5, 7, 9
 */
function isValidTunisianNumber(phone: string): boolean {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 8 && /^[24579]/.test(digits)) return true;
  if (digits.length === 11 && digits.startsWith('216') && /^[24579]/.test(digits.slice(3))) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    // 1. Authorization: Admin protected
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const adminId = (session.user as any).id;
    const body = await req.json();
    const { to, message, type } = body;

    if (!to || !message || !type) {
      return NextResponse.json({ error: 'Missing required fields: to, message, type' }, { status: 400 });
    }

    if (type !== 'single' && type !== 'bulk') {
      return NextResponse.json({ error: 'Invalid type. Use "single" or "bulk"' }, { status: 400 });
    }

    await dbConnect();

    // 2. Validate phone numbers format
    let sent = 0;
    let failed = 0;
    let resultRef;
    let apiStatus: 'sent' | 'failed' = 'failed';
    let errorMessage = '';

    if (type === 'single') {
      if (typeof to !== 'string' || !isValidTunisianNumber(to)) {
        return NextResponse.json({ error: 'Invalid Tunisian phone number format for single sms' }, { status: 400 });
      }

      // Send via WinSMS API
      const result = await WinSMS.sendSMS(to, message);

      if (result.success) {
        sent = 1;
        apiStatus = 'sent';
        resultRef = result.reference;
      } else {
        failed = 1;
        errorMessage = result.error || 'Unknown error';
      }

    } else if (type === 'bulk') {
      if (!Array.isArray(to) || to.length === 0 || to.length > 100) {
        return NextResponse.json({ error: 'For bulk sms, "to" must be an array of 1 to 100 elements' }, { status: 400 });
      }

      // Validate all numbers
      const validNumbers = to.filter(phone => isValidTunisianNumber(phone));
      if (validNumbers.length !== to.length) {
        return NextResponse.json({ error: 'One or more numbers are invalid or not Tunisian' }, { status: 400 });
      }

      // Send via WinSMS API
      const result = await WinSMS.sendBulkSMS(validNumbers, message);

      if (result.success) {
        sent = validNumbers.length;
        apiStatus = 'sent';
        resultRef = result.reference;
      } else {
        failed = validNumbers.length;
        errorMessage = result.error || 'Unknown bulk error';
      }
    }

    // 3. Log into MongoDB
    await (SMSLog as any).create({
      to,
      message,
      status: apiStatus,
      reference: resultRef,
      error: errorMessage || undefined,
      type,
      triggeredBy: adminId,
    } as any);

    if (apiStatus === 'sent') {
      return NextResponse.json({ success: true, sent, failed, reference: resultRef });
    } else {
      return NextResponse.json({ success: false, sent, failed, error: errorMessage }, { status: 502 }); // Bad Gateway / Remote error
    }

  } catch (error: any) {
    console.error('API /sms/send ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
