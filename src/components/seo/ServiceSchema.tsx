import JsonLd from './JsonLd';

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
}

export default function ServiceSchema({ name, description, url, image }: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Étanchéité et Protection",
    "provider": {
      "@type": "HomeAndConstructionBusiness",
      "name": "SDK Batiment"
    },
    "name": name,
    "description": description,
    "url": url,
    "image": image || "https://sdkbatiment.com/logo.png",
    "areaServed": ["Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": name
    }
  };

  return <JsonLd data={schema} />;
}
