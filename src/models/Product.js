import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: [true, 'Le nom du produit est requis'],
        trim: true,
    },
    gamme: {
        type: [String], // Category: Étanchéité Liquide, Adjuvants, etc.
        required: [true, 'Au moins une catégorie est requise'],
        index: true,
    },
    description_courte: {
        type: String,
        required: [true, 'Une description courte est requise'],
    },
    caracteristiques: {
        aspect: String,
        rendement: String,
        temps_sechage: String,
        conditionnement: String
    },
    // New Detailed Technical Fields
    informations: String,           // Description détaillée
    domaine_application: String,    // Où l'utiliser
    avantages: [String],            // Liste des points forts

    donnees_techniques: {
        couleur: String,
        densite: String,
        extrait_sec: String,
        limites_temperature: String // e.g. "5°C à 35°C"
    },

    preparation_support: String,    // Instructions préparation
    conditions_application: String, // Météo, humidité...
    mise_en_oeuvre: String,         // Étapes d'application (1ère couche, etc.)
    consommation: String,           // Détails consommation
    nettoyage: String,              // Nettoyage outils
    stockage: String,               // Durée et conditions
    securite: [String],             // Consignes de sécurité

    point_fidelite: {
        type: Number,
        default: 0,
    },
    images: [String],
    pdf_url: String,
    facebookPixelId: { type: String, default: '' }, // Pixel ID spécifique au produit
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
