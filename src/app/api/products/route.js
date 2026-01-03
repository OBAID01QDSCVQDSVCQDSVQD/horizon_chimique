import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const gamme = searchParams.get('gamme');

        let query = {};
        if (gamme) {
            query.gamme = gamme;
        }

        const products = await Product.find(query);
        return NextResponse.json({ success: true, data: products });
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
        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
