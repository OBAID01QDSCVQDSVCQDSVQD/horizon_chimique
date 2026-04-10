import JsonLd from './JsonLd';

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "SDK Batiment",
    "url": "https://sdkbatiment.com",
    "telephone": "+216 00 000 000", // Placeholder to be updated by user
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Msaken",
      "addressLocality": "Sousse",
      "addressCountry": "TN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.7333,
      "longitude": 10.5833
    },
    "areaServed": ["Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services d'étanchéité",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité toiture" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité terrasse" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité sous-sol" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité piscine" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité parking" } }
      ]
    },
    "priceRange": "$$",
    "inLanguage": ["fr", "ar"],
    "sameAs": [
      "https://facebook.com/sdkbatiment", // Example
      "https://instagram.com/sdkbatiment" // Example
    ]
  };

  return <JsonLd data={schema} />;
}
