import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'HORIZON CHIMIQUE'
    },
    subtitle: {
        type: String,
        default: 'Solutions Techniques & Bâtiment'
    },
    address: {
        type: String,
        default: 'ZI. Oued Ellil, Manouba - Tunisie'
    },
    phone: {
        type: String,
        default: '+216 71 608 000'
    },
    email: {
        type: String,
        default: 'contact@horizon-chimique.tn'
    },
    website: {
        type: String,
        default: 'www.horizon-chimique.tn'
    },
    logoUrl: {
        type: String,
        default: ''
    },
    facebookPixelId: {
        type: String,
        default: ''
    },
    catalogUrl: {
        type: String,
        default: ''
    },
    fidelity: {
        bronze: { type: Number, default: 1.0 },
        silver: { type: Number, default: 1.2 },
        gold: { type: Number, default: 1.5 }
    },
    // About Page Content
    about: {
        heroTitle: { type: String, default: "L'Expertise en Chimie du Bâtiment" },
        heroDescription: { type: String, default: "Depuis plus de 10 ans, Horizon Chimique accompagne les professionnels et particuliers avec des solutions d'étanchéité et de protection innovantes." },
        missionTitle: { type: String, default: "Notre Mission" },
        missionText: { type: String, default: "Chez Horizon Chimique, notre mission est simple : protéger durablement vos constructions. Nous sélectionnons rigoureusement les meilleurs produits chimiques." },
        missionImage: { type: String, default: "" },
        stats: {
            experience: { type: String, default: "+10" },
            projects: { type: String, default: "+5000" },
            experts: { type: String, default: "25" }
        }
    },
    // Mobile App Management
    mobileApp: {
        latestVersion: { type: String, default: '1.0.1' },
        buildNumber: { type: Number, default: 3 },
        forceUpdate: { type: Boolean, default: true },
        updateMessage: { type: String, default: "Une mise à jour importante de l'application (v1.0.1) est disponible. L'amélioration de la galerie et la gestion des publications ont été ajoutées !" },
        downloadUrl: { type: String, default: 'https://sdkbatiment.com/sdk-batiment-app.apk' }
    }
}, { timestamps: true });

// We use a singleton pattern where we almost always fetch the first document
export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
