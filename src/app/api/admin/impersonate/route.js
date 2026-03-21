import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "UserId requis" }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');

        // Save to user (valid for only 60 seconds)
        user.impersonationToken = token;
        user.impersonationExpires = new Date(Date.now() + 60 * 1000);
        await user.save();

        // Return the token and the identifier (email or phone) needed for login
        const identifier = user.email || user.phone;

        return NextResponse.json({ success: true, token, identifier });
    } catch (error) {
        console.error("Impersonation Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
