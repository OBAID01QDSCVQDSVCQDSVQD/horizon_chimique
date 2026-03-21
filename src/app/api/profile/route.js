import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

function normalizePhoneE164(p) {
    if (!p || typeof p !== 'string') return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 8 && /^[2459]/.test(digits)) return '+216' + digits; // 2/4/5/9 (TT, Orange, Ooredoo...)
    if (digits.startsWith('216')) return '+' + digits;
    if (digits.startsWith('0')) return '+216' + digits.slice(1);
    return p.trim() ? (p.startsWith('+') ? p : '+' + p) : '';
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                companyName: user.companyName || '',
                address: user.address || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                phone: user.phone || '', // Existing field
                email: user.email || '', // Existing field
                whatsapp: user.whatsapp || '',
                website: user.website || '',
                facebook: user.facebook || '',
                instagram: user.instagram || '',
                taxId: user.taxId || '',
                image: user.image || '',
                lastLocation: user.lastLocation || null,
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) { // Allow artisans and regular users
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();
        const { name, companyName, address, bio, specialty, phone, whatsapp, website, facebook, instagram, taxId, password, email } = data;

        await dbConnect();

        // Check if email is already taken by another user
        if (email && email.trim() !== '') {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser && existingUser._id.toString() !== session.user.id) {
                return NextResponse.json({ success: false, error: "Cet e-mail est déjà utilisé par un autre compte." }, { status: 400 });
            }
        }

        // Prepare update object (whitelist fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email.toLowerCase().trim();
        if (companyName !== undefined) updateData.companyName = companyName;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;
        if (specialty !== undefined) updateData.specialty = specialty;

        // New Fields
        if (phone !== undefined) updateData.phone = phone?.trim() ? (normalizePhoneE164(phone) || phone.trim()) : null;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (website !== undefined) updateData.website = website;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (data.image !== undefined) updateData.image = data.image; // Profile Picture
        if (data.lastLocation !== undefined) updateData.lastLocation = data.lastLocation;

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, user: updatedUser, message: "Profil mis à jour avec succès" });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
