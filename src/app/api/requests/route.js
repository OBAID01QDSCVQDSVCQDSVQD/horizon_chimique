import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSMS } from "@/lib/winsms";
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
    try {
        // 1. Rate Limiting based on IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const { success } = await rateLimit(`req_form_${ip}`, 5, 900); // 5 requests per 15 mins
        
        if (!success) {
            return NextResponse.json({ 
                success: false, 
                error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." 
            }, { status: 429 });
        }

        await dbConnect();
        const data = await req.json();
        const turnstileToken = data.turnstileToken;

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
                    console.error("❌ Cloudflare Turnstile Error (Requests):", verifyJson['error-codes']);
                }
            } catch (err) {
                console.error("Turnstile fetch error:", err);
            }
        }

        // Basic validation
        if (!data.message) {
            return NextResponse.json({ success: false, error: "Message requis" }, { status: 400 });
        }

        const newRequest = await Request.create(data);

        // Send SMS notification to admin asynchronously (fire and forget)
        try {
            const reqType = data.type?.toUpperCase() || 'DEMANDE';
            const clientName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Client';
            const clientPhone = data.phone || data.whatsapp || 'Non spécifié';
            
            let smsMessage = `🚨 [${reqType}]\nDe: ${clientName}\nTel: ${clientPhone}`;
            
            if (['DIAGNOSTIC', 'RECLAMATION', 'RDV'].includes(reqType)) {
                smsMessage = `🚨 [${reqType}]\nTel: ${clientPhone}`;
                if (data.surface) smsMessage += `\nSurface: ${data.surface}m2`;
                if (data.location?.city) smsMessage += `\nLieu: ${data.location.city}${data.location.state ? ', ' + data.location.state : ''}`;
                if (data.times && data.times[0]) {
                    const dateObj = new Date(data.times[0]);
                    if (!isNaN(dateObj)) {
                        const dateStr = dateObj.toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        smsMessage += `\nDate: ${dateStr}`;
                    }
                }
                const msgAbbr = data.message ? data.message.substring(0, 40) : '';
                if (msgAbbr) smsMessage += `\nMsg: ${msgAbbr}...`;
            } else {
                if (data.projectName) smsMessage += `\nSujet: ${data.projectName}`;
            }

            // Keep SMS length within bounds
            smsMessage = smsMessage.substring(0, 150);
            
            // Send SMS to Admin
            sendSMS('21653520222', smsMessage).catch(e => console.error("Admin SMS Error:", e));

            // Envoyer un SMS de remerciement au client s'il a fourni un numéro
            if (clientPhone && clientPhone !== 'Non spécifié') {
                const clientMsg = `Merci pour votre confiance envers SDK Bâtiment !\n\nVotre demande de ${reqType} a bien été reçue. Notre équipe technique va vous recontacter très prochainement dans les plus brefs délais.\n\nInfos: 53 520 222`;
                sendSMS(clientPhone, clientMsg).catch(e => console.error("Client SMS Error:", e));
            }
        } catch (smsError) {
            console.error("Failed to trigger SMS:", smsError);
        }

        // Send Lead to n8n Webhook asynchronously (fire and forget)
        if (process.env.N8N_WEBHOOK_URL) {
            fetch(process.env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    source: 'devis', 
                    lead: newRequest 
                })
            }).catch(e => console.error("n8n Webhook failed:", e));
        }

        return NextResponse.json({ success: true, message: "Demande envoyée", id: newRequest._id });
    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        await dbConnect();
        const requests = await Request.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
