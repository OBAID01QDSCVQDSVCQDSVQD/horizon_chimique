
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AiSystem from '@/models/AiSystem';
import Product from '@/models/Product'; // Ensure Product model is loaded
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all AI Systems
export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const systems = await AiSystem.find().populate('products.product').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: systems });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a new AI System
export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const system = await AiSystem.create(body);
        return NextResponse.json({ success: true, data: system });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT: Update an AI System
export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        const system = await AiSystem.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ success: true, data: system });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Remove an AI System
export async function DELETE(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await AiSystem.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
