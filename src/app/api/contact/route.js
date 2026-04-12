import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { getServerSession } from 'next-auth';
import { sendSMS } from "@/lib/winsms";
import { rateLimit } from '@/lib/ratelimit';

// POST: Human sends message
export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        
        // 1. Rate Limiting (5 requests per 15 mins)
        const { success: rlOk } = await rateLimit(`contact_${ip}`, 5, 900);
        if (!rlOk) {
            return NextResponse.json({ success: false, error: "Trop de tentatives. Veuillez réessayer plus tard." }, { status: 429 });
        }

        await dbConnect();
        const body = await req.json();
        const { name, phone, email, address, subject, message, turnstileToken } = body;

        // 2. Turnstile Verification
        if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY && turnstileToken) {
            try {
                const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
                        response: turnstileToken,
                        remoteip: ip
                    })
                });
                const verifyJson = await verifyRes.json();
                if (!verifyJson.success) {
                    console.error("❌ Cloudflare Turnstile Error (Contact):", verifyJson['error-codes']);
                }
            } catch (err) {
                console.error("Turnstile fetch error:", err);
            }
        }

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

        // Envoyer un SMS à l'admin
        try {
            const smsMessage = `🚨 Alerte Site: [CONTACT]\nDe: ${name || 'Inconnu'}\nTel: ${phone || 'Non spécifié'}\nSujet: ${subject || 'N/A'}`;
            // Send to Admin
            sendSMS('21653520222', smsMessage).catch(e => console.error("Admin SMS Error:", e));

            // Envoyer un SMS de remerciement au client
            if (phone) {
                const clientMsg = `Merci pour votre confiance envers SDK Bâtiment !\n\nVotre demande a bien été reçue. Notre équipe va vous recontacter très prochainement.\n\nInfos: 53 520 222`;
                sendSMS(phone, clientMsg).catch(e => console.error("Client SMS Error:", e));
            }
        } catch (smsError) {
            console.error("Failed to trigger SMS:", smsError);
        }

        // Send to n8n Webhook asynchronously
        if (process.env.N8N_WEBHOOK_URL) {
            fetch(process.env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    source: 'contact', 
                    lead: newContact 
                })
            }).catch(e => console.error("n8n Webhook failed:", e));
        }

        return NextResponse.json({ success: true, data: newContact }, { status: 201 });
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
