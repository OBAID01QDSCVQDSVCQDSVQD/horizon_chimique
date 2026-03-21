import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Review from '@/models/Review';
import Chantier from '@/models/Chantier'; // Imported to make sure filtered view is correct if needed
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET Pending Items (Admin Only)
export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const pendingComments = await Comment.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('realization', 'title') // Assuming Realization has title
            .sort({ createdAt: -1 });

        const pendingReviews = await Review.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('artisan', 'name companyName') // User model
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            comments: pendingComments,
            reviews: pendingReviews
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT Moderation Action (Admin Only)
export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { type, id, action } = await req.json(); // type: 'comment'|'review', action: 'approve'|'reject'

        if (!['comment', 'review'].includes(type) || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: "Action invalide" }, { status: 400 });
        }

        const Model = type === 'comment' ? Comment : Review;
        const status = action === 'approve' ? 'approved' : 'rejected';

        // If rejected, maybe we want to delete it or just mark rejected?
        // User asked for "Reviews comment with possibility to publish or not"
        // Rejected usually means "don't show". Deleting is cleaner for DB, but keeping logs is better.
        // I'll update status to 'rejected' OR delete. 
        // Let's stick to status updates for now so admin can see history, or delete.
        // User plan said "Reject (Trash)". Maybe Delete is better. 
        // I will implement: Approve -> status='approved'. Reject -> DELETE.

        let result;
        if (action === 'reject') {
            result = await Model.findByIdAndDelete(id);
            return NextResponse.json({ success: true, message: "Élément supprimé" });
        } else {
            result = await Model.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
            return NextResponse.json({ success: true, data: result, message: "Élément approuvé" });
        }

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
