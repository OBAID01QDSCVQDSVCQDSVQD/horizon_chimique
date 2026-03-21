import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET all users (filtering by role/status via query params implied, or just return pending artisans first)
export async function GET(req) {
    try {
        await dbConnect();
        // Fetch pending artisans
        const pendingArtisans = await User.find({ role: 'artisan', status: 'pending' }).sort({ createdAt: -1 });
        // Fetch others if needed
        const allUsers = await User.find({}).sort({ createdAt: -1 }).limit(50); // Just for list

        return NextResponse.json({ success: true, pending: pendingArtisans, all: allUsers });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { userId, status, role, fidelityRank, parentGoldArtisan } = await req.json();
        await dbConnect();

        const updateData = {};
        if (status) updateData.status = status;
        if (role) updateData.role = role;
        if (fidelityRank) updateData.fidelityRank = fidelityRank;
        if (parentGoldArtisan !== undefined) updateData.parentGoldArtisan = parentGoldArtisan;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 });

        await dbConnect();
        await User.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
