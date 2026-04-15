import CatalogClient from './CatalogClient';
import { Download } from 'lucide-react';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export async function generateMetadata() {
  return {
    title: 'Catalogue Général 2026 | Horizon Chimique - Solutions d\'Étanchéité',
    description: 'Consultez notre catalogue 2025-2026 pour découvrir nos solutions d\'étanchéité innovantes, nos produits chimiques pour le bâtiment et nos références prestigieuses en Tunisie.',
    keywords: [
      'catalogue horizon chimique', 
      'produits étanchéité tunisie', 
      'solutions bâtiment tunisie', 
      'étanchéité toiture', 
      'protection structures',
      'références chantiers tunisie'
    ],
    openGraph: {
      title: 'Catalogue Horizon Chimique 2025-2026',
      description: 'L\'excellence technique en matière d\'étanchéité et de protection durable.',
      images: ['/og-image.jpg'],
    }
  };
}

async function getSettings() {
  await dbConnect();
  const settings = await Setting.findOne({});
  return settings ? JSON.parse(JSON.stringify(settings)) : null;
}

export default async function CataloguePage() {
  const settings = await getSettings();
  const catalogUrl = settings?.catalogUrl || '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "Catalogue Horizon Chimique 2026",
    "description": "Solutions d'étanchéité et de protection durable des structures en Tunisie.",
    "publisher": {
      "@type": "Organization",
      "name": "Horizon Chimique",
      "url": "https://sdkbatiment.com"
    },
    "inLanguage": "fr",
    "about": [
      { "@type": "Thing", "name": "Étanchéité" },
      { "@type": "Thing", "name": "Isolation thermique" },
      { "@type": "Thing", "name": "SELF 60" },
      { "@type": "Thing", "name": "HORIFLEX 110" },
      { "@type": "Thing", "name": "Imperméabilisation" }
    ],
    "url": "https://sdkbatiment.com/catalogue",
    "contentUrl": catalogUrl
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[85vh] flex flex-col relative border border-slate-100 mb-12">
        <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 sticky top-0 z-10 gap-4">
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-500">
              Catalogue Général 2026
            </h1>
            <p className="text-slate-500 font-medium mt-1">L'excellence technique pour vos projets d'étanchéité.</p>
          </div>
          {catalogUrl && (
            <a 
              href={catalogUrl} 
              download 
              target="_blank" 
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
            >
              <Download size={20} className="group-hover:bounce" /> 
              <span>Télécharger le PDF</span>
            </a>
          )}
        </div>

        <CatalogClient initialCatalogUrl={catalogUrl} />

        {/* Hidden SEO Content - Indexed Catalog Text for Deep Search Visibility */}
        {settings?.catalogExtractedText && (
          <div className="sr-only" aria-hidden="true">
            {settings.catalogExtractedText}
          </div>
        )}
      </div>

      {/* SEO & Index Technique Section - Visible for both Bots and Users */}
      <section className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4">
            <span className="w-12 h-1 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </span>
            Index Technique et Références
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4">À Propos d'Horizon Chimique</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Horizon Chimique est le partenaire de référence en matière d’étanchéité et de protection durable des structures en Tunisie. Reconnu pour la fiabilité et la performance de ses produits, Horizon Chimique propose des solutions innovantes répondant aux normes les plus strictes de qualité.
              </p>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Secteurs d'Intervention</h3>
              <ul className="grid grid-cols-2 gap-3">
                {['Industrie', 'Tourisme', 'Résidentiel', 'Immobilier', 'Santé', 'Gouvernemental'].map(sector => (
                  <li key={sector} className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {sector}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Références Prestigieuses</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'SIÈGE BIAT', 'SIÈGE BNA', 'HÔPITAL CHARLES NICOLE', 'CLINIQUE LA ROSE', 
                  'CLUB MED DJERBA', 'LEONI', 'COFICAB', 'ARVEA', 'SOTUFAM', 'DATAXION',
                  'GROUPE POULINA', 'HOTEL LODGE KAIROUAN', 'MAGIC YACHT BIZERTE',
                  'ASSEMBLÉE DES REPRÉSENTANTS DU PEUPLE', 'MINISTÈRE DES AFFAIRES ÉTRANGÈRES'
                ].map(ref => (
                  <span key={ref} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-100">
                    {ref}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-slate-500 text-sm italic">
                Retrouvez l'intégralité de nos fiches techniques et détails de mise en œuvre dans notre catalogue téléchargeable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
