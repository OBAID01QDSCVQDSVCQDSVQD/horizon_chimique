import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { getServerSession } from 'next-auth'; // Verify if using next-auth

// POST: Human sends message
export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, phone, email, address, subject, message } = body;

        // Validation (Server side)
        if (!name || !phone) {
            return NextResponse.json({ success: false, error: 'Nom et Téléphone sont obligatoires.' }, { status: 400 });
        }

        const newContact = await Contact.create({
            name,
            phone,
            email,
            address,
            subject,
            message,
        });

        return NextResponse.json({ success: true, daa: newContact }, { status: 201 });
    } catch (error) {
        console.error('Contact error:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 });
    }
}

// GET: Admin retrieves messages
export async function GET(req) {
    await dbConnect();
    // Ideally authenticate admin here. Assuming session check or similar.
    // For now, let's fetch all sorted by date.
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: contacts });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}
