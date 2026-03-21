import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET Reviews
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const artisanId = searchParams.get('artisanId');

        // Check current session to find user's own review
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!artisanId) return NextResponse.json({ error: "Artisan ID requis" }, { status: 400 });

        // Fetch approved reviews for public list
        const reviews = await Review.find({
            artisan: artisanId,
            status: 'approved'
        })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });

        // Calculate Average
        let average = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            average = (sum / reviews.length).toFixed(1);
        }

        // Check if user has ANY review (pending or approved or rejected)
        let userReview = null;
        if (userId) {
            userReview = await Review.findOne({ artisan: artisanId, user: userId });
        }

        return NextResponse.json({
            success: true,
            data: reviews,
            average,
            total: reviews.length,
            userReview // Return user's specific review for editing
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST Review (Create or Update)
export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await req.json();
        const { artisanId, rating, comment } = body;

        if (!artisanId || !rating || !comment) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        if (session.user.id === artisanId) {
            return NextResponse.json({ error: "Vous ne pouvez pas vous évaluer vous-même" }, { status: 400 });
        }

        // Check for existing review
        const existingReview = await Review.findOne({
            artisan: artisanId,
            user: session.user.id
        });

        if (existingReview) {
            // UPDATE existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.status = 'pending'; // Reset to pending for re-moderation
            await existingReview.save();

            return NextResponse.json({
                success: true,
                message: "Votre avis a été mis à jour et est en attente de modération."
            });
        } else {
            // CREATE new review
            await Review.create({
                artisan: artisanId,
                user: session.user.id,
                rating,
                comment,
                status: 'pending'
            });

            return NextResponse.json({
                success: true,
                message: "Avis envoyé avec succès, en attente de validation."
            });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
