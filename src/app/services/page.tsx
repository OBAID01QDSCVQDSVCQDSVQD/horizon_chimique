import { buildMetadata } from '@/lib/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = buildMetadata(
  "Nos Services d'Étanchéité",
  "Découvrez nos solutions professionnelles d'étanchéité pour toitures, terrasses et fondations à Sousse et partout en Tunisie.",
  "/services"
);

export default function ServicesPage() {
  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="text-4xl font-bold mb-6">Expertise en Étanchéité & Protection</h1>
      <p className="text-lg text-slate-600 mb-8">
        SDK Batiment propose une gamme complète de services pour protéger vos structures contre l'humidité et les infiltrations.
      </p>
      {/* Content for services listing */}
    </div>
  );
}
