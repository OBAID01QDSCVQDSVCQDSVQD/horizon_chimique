import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import User from '@/models/User'; // Ensure User model is loaded
import Comment from '@/models/Comment';
import Review from '@/models/Review';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'artisan' && session.user.role !== 'admin')) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();
        const { title, description, tags, images, location, completionDate } = data;

        if (!title || !description || !images || images.length === 0) {
            return NextResponse.json({ success: false, error: "Titre, description et images sont requis." }, { status: 400 });
        }

        await dbConnect();

        const newRealization = await Realization.create({
            artisan: session.user.id,
            title,
            description,
            tags,
            images,
            location,
            completionDate
        });

        return NextResponse.json({
            success: true,
            message: "Projet ajouté avec succès !",
            realization: newRealization
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const mine = searchParams.get('mine');
        const artisanId = searchParams.get('artisan');

        await dbConnect();

        let query = { isVisible: true };

        if (mine) {
            const session = await getServerSession(authOptions);
            if (!session) return NextResponse.json({ success: false, error: "Non connecté" }, { status: 401 });
            query = { artisan: session.user.id };
        } else if (artisanId) {
            query.artisan = artisanId;
        }

        const realizations = await Realization.find(query)
            .populate('artisan', 'name companyName image fidelityRank points')
            .sort({ createdAt: -1 })
            .lean();

        // Add stats
        const data = await Promise.all(realizations.map(async (p) => {
            const commentsCount = await Comment.countDocuments({ realization: p._id, status: 'approved' });

            // Calculate Artisan Rating
            let artisanRating = 0;
            // let artisanReviewCount = 0; // Optional if needed
            if (p.artisan && p.artisan._id) {
                const reviews = await Review.find({ artisan: p.artisan._id, status: 'approved' }).select('rating');
                if (reviews.length > 0) {
                    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                    artisanRating = (sum / reviews.length).toFixed(1); // Keep as string "4.5"
                }
            }

            return {
                ...p,
                likesCount: Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0),
                commentsCount,
                artisanRating: parseFloat(artisanRating)
            };
        }));

        return NextResponse.json({ success: true, realizations: data });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
