import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req) {
    try {
        await dbConnect();
        // Select minimal fields for dropdowns
        const products = await Product.find({}, 'designation reference packaging').sort({ designation: 1 });
        return NextResponse.json({ success: true, products });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Bulk Update Session:", session); // DEBUG
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                error: `Non autorisé. Role: ${session?.user?.role || 'None'}`,
                debug: session
            }, { status: 401 });
        }

        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ success: false, error: "Aucun produit à mettre à jour." }, { status: 400 });
        }

        await dbConnect();

        const bulkOps = products.map(p => ({
            updateOne: {
                filter: { _id: p._id },
                update: { $set: { point_fidelite: Number(p.point_fidelite) || 0 } }
            }
        }));

        await Product.bulkWrite(bulkOps);

        return NextResponse.json({ success: true, message: `${products.length} produits mis à jour avec succès.` });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
