import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    // Cleanup first to avoid duplicates (optional, safety)
    // await User.deleteMany({ email: { $regex: 'artisan_demo' } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const dummies = [
        {
            name: "Ahmed Bennaceur",
            email: "artisan_demo1@test.com",
            phone: "50111222",
            role: "artisan",
            specialty: "Étanchéité Liquide",
            companyName: "Bennaceur Batiment",
            lastLocation: { lat: 36.85, lng: 10.20, address: "La Marsa, Tunis" }, // Near
            image: "",
            password: hashedPassword
        },
        {
            name: "Samir Tounsi",
            email: "artisan_demo2@test.com",
            phone: "50333444",
            role: "artisan",
            specialty: "Isolation Thermique",
            companyName: "Iso-Pro",
            lastLocation: { lat: 36.80, lng: 10.18, address: "Centre Ville, Tunis" }, // Very Near
            image: "",
            password: hashedPassword
        },
        {
            name: "Karim Maaloul",
            email: "artisan_demo3@test.com",
            phone: "50555666",
            role: "artisan",
            specialty: "Revêtement Sol",
            companyName: "Maaloul Deco",
            lastLocation: { lat: 35.82, lng: 10.63, address: "Sousse" }, // Far (~140km)
            image: "",
            password: hashedPassword
        }
    ];

    for (const d of dummies) {
        const exist = await User.findOne({ email: d.email });
        if (!exist) {
            await User.create(d);
        }
    }

    return NextResponse.json({ success: true, message: "Demo Artisans Created!" });
}
