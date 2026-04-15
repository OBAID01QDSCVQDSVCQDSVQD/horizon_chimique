import fs from 'fs';
import mongoose from 'mongoose';

// Manual .env.local parsing
function loadEnv() {
    const envPath = './.env.local';
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            process.env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        }
    });
}
loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

// High-Density SEO Content organized by section
// This replaces raw OCR with clean, keyword-rich structured text
const curatedCatalogText = `
--- CATALOGUE TECHNIQUE HORIZON CHIMIQUE 2026 ---

SOLUTIONS D'ÉTANCHÉITÉ ET IMPERMÉABILISATION :
- SELF 60 : Système d'étanchéité liquide bicouche armé par un voile géotextile. Solution idéale pour les terrasses inaccessibles et toitures techniques.
- HORIFLEX 110 : Revêtement d'imperméabilisation monocomposant haute performance, prêt à l'emploi pour zones humides et structures en béton.
- HORIFLEX 100 : Enduit d'imperméabilisation flexible pour bassins, cuves et fondations.
- HORI ETANCHE : Système complet d'étanchéité liquide pour terrasses circulables et parkings.
- GEOTEX 60 : Armature géotextile non-tissée pour le renforcement des systèmes d'étanchéité liquide (SEL).
- MEMBRANE BITUMINEUSE : Rouleaux d'étanchéité traditionnels pour toitures terrasses et dalles de compression.

DOMAINES D'EXPERTISE ET APPLICATIONS :
- Étanchéité de toitures terrasses (accessibles et inaccessibles).
- Imperméabilisation de piscines, bâches à eau et réservoirs.
- Protection des fondations et sous-sols contre les infiltrations.
- Revêtements industriels et sols en résine époxy.

RÉFÉRENCES PRESTIGIEUSES EN TUNISIE :
- SECTEUR FINANCIER : Siège BIAT Tunis, Siège BNA Tunis, Siège BIAT Jammel.
- SECTEUR SANTÉ : Hôpital Charles Nicolle Tunis, Clinique La Rose Lac 1, Hôpital Rabta, Hôpital Kassab.
- INSTITUTIONS : Assemblée des Représentants du Peuple, Ministère des Affaires Étrangères.
- INDUSTRIE : LEONI Messaadine, COFICAB, MISFAT, SOTUFAM, SOTUMED, VERNICOLOR Group.
- TOURISME : Hotel Club Med Djerba, Galaxy Hammamet, Magic Yacht Bizerte.
- RÉSIDENTIEL : Résidence Ennour (Centre Urbain Nord), Résidence Les Étoiles (Ennasr).

ZONES D'INTERVENTION EN TUNISIE :
Tunis, Ariana, Ben Arous, Manouba, Nabeul, Hammamet, Sousse, Monastir, Mahdia, Sfax, Kairouan, Bizerte, Djerba, Zarzis, Gabès, Gafsa.

SDK BATIMENT - Distributeur Officiel Horizon Chimique.
Siège Professionnel : Sousse, Tunisie | Tél : +216 53 520 222
Site : sdkbatiment.com

HORIZON CHIMIQUE - LE PARTENAIRE DE RÉFÉRENCE EN CHIMIE DU BÂTIMENT EN TUNISIE.
Qualité irréprochable conforme aux normes TN et internationales.
Service Technique : +216 31 520 033 | contact@horizon-chimique.tn
`;

async function run() {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI missing");
        process.exit(1);
    }

    console.log("Saving Curated Technical Index to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    
    await mongoose.connection.collection('settings').updateOne(
        {},
        { $set: { catalogExtractedText: curatedCatalogText.trim() } },
        { upsert: true }
    );
    
    console.log("✅ Success! The Digital Catalog Index is now live for SEO/AEO.");
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
