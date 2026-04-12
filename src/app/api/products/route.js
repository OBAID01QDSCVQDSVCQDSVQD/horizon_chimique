import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const gamme = searchParams.get('gamme');

        // مفتاح التخزين في Redis
        const cacheKey = gamme ? `products:gamme:${gamme}` : 'products:all';

        // 1. محاولة جلب البيانات من Redis
        if (redis) {
            try {
                const cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    // console.log('Serving from Redis Cache ⚡');
                    return NextResponse.json({ success: true, data: JSON.parse(cachedData), cached: true });
                }
            } catch (redisError) {
                console.error('Redis GET Error:', redisError);
            }
        }

        // 2. إذا لم توجد في Redis، نجلبها من MongoDB
        let query = {};
        if (gamme) {
            query.gamme = gamme;
        }
        const products = await Product.find(query);

        // 3. تخزين النتيجة في Redis لمدة ساعة (3600 ثانية)
        if (redis && products.length > 0) {
            try {
                await redis.set(cacheKey, JSON.stringify(products), 'EX', 3600);
            } catch (redisError) {
                console.error('Redis SET Error:', redisError);
            }
        }

        return NextResponse.json({ success: true, data: products, cached: false });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const product = await Product.create(body);
        
        // مسح الـ Cache عند إضافة منتج جديد لضمان تحديث البيانات
        if (redis) {
            await redis.del('products:all');
            if (product.gamme) {
                const gammes = Array.isArray(product.gamme) ? product.gamme : [product.gamme];
                for (const g of gammes) {
                    await redis.del(`products:gamme:${g}`);
                }
            }
        }

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
