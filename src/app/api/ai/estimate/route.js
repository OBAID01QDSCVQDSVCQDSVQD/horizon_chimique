
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AiSystem from '@/models/AiSystem';
import Product from '@/models/Product';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { surfaceArea, supportType, specificIssues, clientName } = body;

        if (!surfaceArea || !supportType) {
            return NextResponse.json({ success: false, error: 'Données incomplètes' }, { status: 400 });
        }

        // 1. Find the Matching AI System
        // We look for a system where 'triggerKeywords' contains the 'supportType' (case-insensitive)
        const allSystems = await AiSystem.find({ isActive: true }).populate('products.product');

        let matchedSystem = allSystems.find(sys =>
            sys.triggerKeywords.some(k => supportType.toLowerCase().includes(k.toLowerCase()))
        );

        // Fallback to a default system if none found (optional, or error out)
        if (!matchedSystem && allSystems.length > 0) {
            matchedSystem = allSystems[0]; // Pick the first one as default? Or generic?
        }

        if (!matchedSystem) {
            return NextResponse.json({ success: false, error: "Aucun système compatible trouvé pour ce type de support. Contactez l'admin." }, { status: 404 });
        }

        // 2. Prepare Context for OpenAI
        const productsContext = matchedSystem.products.map(p => {
            const prod = p.product;
            return `- ${prod.designation} (Ref: ${prod.reference}): Role=${p.role}, Est. Consumption=${p.consumptionRate || 'Auto'} kg/m2, PackSize=${prod.packaging || '20kg'}`;
        }).join('\n');

        const systemPrompt = `
        You are an expert Quantity Estimator for 'Horizon Chimique'.
        
        CRITICAL RULES (FOLLOW STRICTLY):
        1. You must ONLY use the products listed in the "AVAILABLE PRODUCTS" section below. Do NOT hallucinate or suggest external products.
        2. If the user's request matches the system logic, calculate quantities based strictly on the provided consumption rates.
        3. If a product has a specific consumption rate (e.g., "1.5 kg/m2") in the context, USE IT exactly.
        4. Output must be in French (advice and usage).
        
        SYSTEM LOGIC (From Admin):
        ${matchedSystem.basePrompt}

        AVAILABLE PRODUCTS (Exclusive List):
        ${productsContext}

        TASK:
        Calculate quantities for a project with:
        - Surface: ${surfaceArea} m2
        - Support: ${supportType}
        - Issues: ${specificIssues || 'None'}

        OUTPUT FORMAT (JSON ONLY, NO TEXT BEFORE/AFTER):
        {
            "items": [
                { "productName": "Exact Name from List", "reference": "Ref", "quantity": "Total Kg (number + unit)", "packs": "Number of buckets/bags", "usage": "Layer description in French" }
            ],
            "advice": "Technical advice in French based on the specific issues and support type."
        }
        `;

        // 3. Call OpenAI (or Mock if no Key)
        let aiResult;
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo", // or gpt-4o for better reasoning
                    messages: [
                        { role: "system", content: "You are a helpful JSON-speaking construction assistant." },
                        { role: "user", content: systemPrompt }
                    ],
                    temperature: 0.2
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const content = data.choices[0].message.content;
                // Clean markdown if present
                const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
                aiResult = JSON.parse(jsonStr);
            } else {
                throw new Error("OpenAI error: " + JSON.stringify(data));
            }
        } else {
            // MOCK RESPONSE (For testing without billing)
            aiResult = {
                items: matchedSystem.products.map(p => ({
                    productName: p.product.designation,
                    reference: p.product.reference,
                    quantity: (surfaceArea * (p.consumptionRate || 1)).toFixed(1) + " kg",
                    packs: Math.ceil((surfaceArea * (p.consumptionRate || 1)) / 20) + " seaux",
                    usage: p.role
                })),
                advice: "Ceci est une estimation automatique (Mode Test). Pour des résultats précis, configurez la clé API OpenAI."
            };
        }

        return NextResponse.json({ success: true, data: aiResult, systemName: matchedSystem.name });

    } catch (error) {
        console.error("AI Estimate Error:", error);
        return NextResponse.json({ success: false, error: "Erreur de calcul: " + error.message }, { status: 500 });
    }
}
