import JsonLd from './JsonLd';

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "SDK Batiment",
    "alternateName": "Horizon Chimique",
    "url": "https://sdkbatiment.com",
    "logo": "https://sdkbatiment.com/logo.png",
    "image": "https://sdkbatiment.com/og-image.jpg",
    "telephone": "+216 53 520 222",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Msaken",
      "addressLocality": "Sousse",
      "addressRegion": "Sousse",
      "addressCountry": "TN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.7333,
      "longitude": 10.5833
    },
    "areaServed": [
      { "@type": "City", "name": "Sousse" },
      { "@type": "City", "name": "Monastir" },
      { "@type": "City", "name": "Mahdia" },
      { "@type": "City", "name": "Sfax" },
      { "@type": "City", "name": "Kairouan" },
      { "@type": "City", "name": "Tunis" },
      { "@type": "City", "name": "Nabeul" },
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Produits et Services d'étanchéité",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité toiture" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité terrasse" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité sous-sol" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité piscine" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité parking" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Isolation thermique" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Étanchéité liquide" } },
      ]
    },
    "priceRange": "$$",
    "inLanguage": ["fr", "ar"],
    "sameAs": [
      "https://www.facebook.com/horizonchimique",
      "https://www.instagram.com/horizonchimique",
      "https://www.tiktok.com/@horizon.chimique"
    ]
  };

  return <JsonLd data={schema} />;
}

