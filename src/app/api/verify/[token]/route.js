import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chantier from '@/models/Chantier';
import User from '@/models/User';
import Product from '@/models/Product';
import Setting from '@/models/Setting';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { token } = params;

        const chantier = await Chantier.findOne({
            verificationToken: token,
            tokenExpiresAt: { $gt: new Date() } // Check expiry
        }).populate('artisan', 'name phone');

        if (!chantier) {
            return NextResponse.json({ success: false, error: "Lien invalide ou expiré." }, { status: 404 });
        }

        if (chantier.status === 'approved') {
            return NextResponse.json({ success: false, error: "Ce chantier a déjà été validé." }, { status: 400 });
        }

        return NextResponse.json({ success: true, chantier });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { token } = params;
        const { rating } = await req.json();

        // 1. Find Chantier
        const chantier = await Chantier.findOne({
            verificationToken: token,
            tokenExpiresAt: { $gt: new Date() }
        });

        if (!chantier) {
            return NextResponse.json({ success: false, error: "Lien invalide ou expiré." }, { status: 404 });
        }

        if (chantier.status === 'approved') {
            return NextResponse.json({ success: false, error: "Déjà validé." }, { status: 400 });
        }

        // 2. Fetch Settings & Artisan for Rank Calculation
        const artisan = await User.findById(chantier.artisan);
        const settingsDoc = await Setting.findOne();
        const fidelityRef = settingsDoc?.fidelity || { bronze: 1.0, silver: 1.2, gold: 1.5 };

        let multiplier = fidelityRef.bronze;

        // Priority to Manual Rank, then fallback to points
        const manualRank = artisan.fidelityRank;

        if (manualRank === 'gold' || (!manualRank && artisan.points >= 5000)) {
            multiplier = fidelityRef.gold;
        } else if (manualRank === 'silver' || (!manualRank && artisan.points >= 1000)) {
            multiplier = fidelityRef.silver;
        } else {
            multiplier = fidelityRef.bronze;
        }

        // 3. Calculate Base Points
        let rawPoints = 0;
        const designations = chantier.products.map(p => p.designation);
        const productsDb = await Product.find({ designation: { $in: designations } });

        for (const item of chantier.products) {
            const productDoc = productsDb.find(p => p.designation === item.designation);
            if (productDoc) {
                rawPoints += (productDoc.point_fidelite || 0) * (item.quantity || 1);
            }
        }

        // Apply Rank Multiplier
        let totalPoints = Math.round(rawPoints * multiplier);

        // Bonus: +10% if rating is 5/5
        if (rating === 5) {
            totalPoints = Math.ceil(totalPoints * 1.10);
        }

        // 3. Update Chantier
        chantier.status = 'approved';
        chantier.pointsEarned = totalPoints;
        chantier.clientRating = rating;
        chantier.verificationToken = undefined; // consume token (optional, or keep for record)
        // actually keeping it but checking status='approved' prevents reuse
        await chantier.save();

        // 4. Update Artisan Points
        await User.findByIdAndUpdate(chantier.artisan, {
            $inc: { points: totalPoints }
        });

        return NextResponse.json({ success: true, points: totalPoints });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
