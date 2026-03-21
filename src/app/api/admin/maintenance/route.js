import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Warranty from '@/models/Warranty';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
        }

        // Aggregate to get a flat list of visits
        const visits = await Warranty.aggregate([
            { $match: { status: 'approved' } }, // Filter FIRST to only show approved warranties
            { $unwind: "$maintenanceVisits" },
            {
                $match: {
                    "maintenanceVisits.date": { $exists: true }
                    // Optionally filter only future/pending here if needed
                }
            },
            { $sort: { "maintenanceVisits.date": 1 } },
            {
                $lookup: {
                    from: "users", // Assuming artisans are in 'users' collection
                    localField: "artisan",
                    foreignField: "_id",
                    as: "artisanData"
                }
            },
            { $unwind: { path: "$artisanData", preserveNullAndEmptyArrays: true } }, // Unwind artisan info
            {
                $project: {
                    _id: 1,
                    contractNumber: 1,
                    clientName: 1,
                    visitDate: "$maintenanceVisits.date",
                    visitStatus: "$maintenanceVisits.status",
                    visitNotes: "$maintenanceVisits.notes",
                    artisanName: "$artisanData.name",
                    artisanEmail: "$artisanData.email",
                    chantier: 1
                }
            }
        ]);

        return NextResponse.json({ success: true, data: visits });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
        }

        const body = await req.json();
        const { warrantyId, visitDate, status } = body;

        // Update the specific visit in the array
        const result = await Warranty.updateOne(
            {
                _id: warrantyId,
                "maintenanceVisits.date": new Date(visitDate)
            },
            {
                $set: { "maintenanceVisits.$.status": status }
            }
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
