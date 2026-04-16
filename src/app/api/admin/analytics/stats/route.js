import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import UserAnalytics from '@/models/Analytics';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 1));

        // 1. Visitor Stats (Sessions)
        const todaySessions = await UserAnalytics.distinct('sessionId', { createdAt: { $gte: startOfToday } });
        const yesterdaySessions = await UserAnalytics.distinct('sessionId', { 
            createdAt: { $gte: startOfYesterday, $lt: startOfToday } 
        });

        // 2. Top Countries
        const topCountries = await UserAnalytics.aggregate([
            { $match: { country: { $ne: 'Unknown' } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 3. Top Pages
        const topPages = await UserAnalytics.aggregate([
            { $match: { type: 'pageview' } },
            { $group: { _id: '$page', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 4. Last 24 Hours Activity (per hour)
        const activity24h = await UserAnalytics.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.day': 1, '_id.hour': 1 } }
        ]);

        // 5. Total counts
        const totalPageViews = await UserAnalytics.countDocuments({ type: 'pageview' });
        const totalUniqueVisitors = await UserAnalytics.distinct('sessionId').then(s => s.length);

        return NextResponse.json({
            success: true,
            data: {
                visitors: {
                    today: todaySessions.length,
                    yesterday: yesterdaySessions.length,
                    total: totalUniqueVisitors
                },
                topCountries,
                topPages,
                activity24h,
                totalPageViews
            }
        });
    } catch (error) {
        console.error('Admin Analytics Stats Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
