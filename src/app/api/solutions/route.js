import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import redis from '@/lib/redis';

export async function GET() {
    try {
        await dbConnect();
        
        // 1. محاولة جلب الحلول من Redis
        const cacheKey = 'solutions:all';
        if (redis) {
            try {
                const cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    return NextResponse.json({ success: true, data: JSON.parse(cachedData), cached: true });
                }
            } catch (err) {
                console.error('Redis GET Error:', err);
            }
        }

        const solutions = await Solution.find({}).sort({ createdAt: -1 });

        // 2. تخزين النتائج في Redis لمدة ساعة
        if (redis && solutions.length > 0) {
            try {
                await redis.set(cacheKey, JSON.stringify(solutions), 'EX', 3600);
            } catch (err) {
                console.error('Redis SET Error:', err);
            }
        }

        return NextResponse.json({ success: true, data: solutions, cached: false });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const solution = await Solution.create(body);

        // مسح الـ Cache بعد إضافة حل جديد
        if (redis) {
            await redis.del('solutions:all');
        }

        return NextResponse.json({ success: true, data: solution });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
