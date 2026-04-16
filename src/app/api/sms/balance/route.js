import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { WinSMS } from '@/lib/sms';

export async function GET(req) {
  try {
    // 1. Authorization: Admin protected
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 2. WinSMS Balance
    const balanceInfo = await WinSMS.checkBalance();

    if (!balanceInfo) {
      return NextResponse.json({ error: 'Failed to retrieve balance from WinSMS.' }, { status: 502 });
    }

    // 3. Return JSON
    return NextResponse.json({ success: true, balance: balanceInfo.balance, licence: balanceInfo.licence }, { status: 200 });

  } catch (error) {
    console.error('API /sms/balance ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
