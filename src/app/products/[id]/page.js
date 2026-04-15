import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ProductClient from './ProductClient';

export async function generateMetadata({ params: { id } }) {
  try {
    await dbConnect();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };
    const product = await Product.findOne(query).lean();

    if (!product) {
      return {
        title: 'Produit Introuvable',
        description: 'Ce produit n\'existe pas sur SDK Batiment.',
      };
    }

    const title = `${product.designation} | SDK Batiment - Produits Bâtiment Tunisie`;
    const description = product.description_courte || `Découvrez ${product.designation} chez SDK Batiment.`;
    const ogImage = product.images && product.images.length > 0
      ? (product.images[0].startsWith('http') ? product.images[0] : `https://sdkbatiment.com${product.images[0]}`)
      : 'https://sdkbatiment.com/logo.png';

    // Dynamic keywords from product data
    const keywords = [
      product.designation,
      ...(product.gamme || []),
      'SDK Batiment',
      'produit bâtiment Tunisie',
      'étanchéité',
      'isolation',
      product.caracteristiques?.conditionnement,
      product.domaine_application ? 'domaine application' : null,
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `https://sdkbatiment.com/products/${product.slug || id}`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://sdkbatiment.com/products/${product.slug || id}`,
        siteName: 'SDK Batiment',
        locale: 'fr_TN',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: product.designation,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for product:', error);
    return {
      title: 'Produit | SDK Batiment',
      description: 'Découvrez les produits de SDK Batiment.',
    };
  }
}

export default async function Page({ params: { id } }) {
  await dbConnect();

  let product = null;
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };
    product = await Product.findOne(query).lean();
  } catch (e) {
    // Product not found
  }

  // JSON-LD Product Schema for Google Rich Results
  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.designation,
    description: product.description_courte || '',
    image: product.images && product.images.length > 0 ? product.images : [],
    brand: {
      '@type': 'Brand',
      name: 'SDK Batiment',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Horizon Chimique',
      url: 'https://sdkbatiment.com',
    },
    category: (product.gamme || []).join(', '),
    ...(product.caracteristiques?.conditionnement && {
      weight: product.caracteristiques.conditionnement,
    }),
    additionalProperty: [
      ...(product.caracteristiques?.aspect ? [{ '@type': 'PropertyValue', name: 'Aspect', value: product.caracteristiques.aspect }] : []),
      ...(product.caracteristiques?.rendement ? [{ '@type': 'PropertyValue', name: 'Rendement', value: product.caracteristiques.rendement }] : []),
      ...(product.caracteristiques?.temps_sechage ? [{ '@type': 'PropertyValue', name: 'Temps de séchage', value: product.caracteristiques.temps_sechage }] : []),
      ...(product.donnees_techniques?.couleur ? [{ '@type': 'PropertyValue', name: 'Couleur', value: product.donnees_techniques.couleur }] : []),
      ...(product.donnees_techniques?.densite ? [{ '@type': 'PropertyValue', name: 'Densité', value: product.donnees_techniques.densite }] : []),
      ...(product.donnees_techniques?.extrait_sec ? [{ '@type': 'PropertyValue', name: 'Extrait sec', value: product.donnees_techniques.extrait_sec }] : []),
      ...(product.donnees_techniques?.limites_temperature ? [{ '@type': 'PropertyValue', name: 'Limites de température', value: product.donnees_techniques.limites_temperature }] : []),
    ].filter(Boolean),
  } : null;

  // Breadcrumb Schema
  const breadcrumbJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://sdkbatiment.com' },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: 'https://sdkbatiment.com/products' },
      { '@type': 'ListItem', position: 3, name: product.designation },
    ],
  } : null;

  // FAQ Schema from product data (avantages, domaine_application, etc.)
  const faqItems = [];
  if (product?.domaine_application) {
    faqItems.push({
      '@type': 'Question',
      name: `Où utiliser ${product.designation} ?`,
      acceptedAnswer: { '@type': 'Answer', text: product.domaine_application },
    });
  }
  if (product?.mise_en_oeuvre) {
    faqItems.push({
      '@type': 'Question',
      name: `Comment appliquer ${product.designation} ?`,
      acceptedAnswer: { '@type': 'Answer', text: product.mise_en_oeuvre },
    });
  }
  if (product?.preparation_support) {
    faqItems.push({
      '@type': 'Question',
      name: `Comment préparer le support pour ${product.designation} ?`,
      acceptedAnswer: { '@type': 'Answer', text: product.preparation_support },
    });
  }
  if (product?.stockage) {
    faqItems.push({
      '@type': 'Question',
      name: `Comment stocker ${product.designation} ?`,
      acceptedAnswer: { '@type': 'Answer', text: product.stockage },
    });
  }
  if (product?.consommation) {
    faqItems.push({
      '@type': 'Question',
      name: `Quelle est la consommation de ${product.designation} ?`,
      acceptedAnswer: { '@type': 'Answer', text: product.consommation },
    });
  }

  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  } : null;

  return (
    <>
      {/* JSON-LD Structured Data for Google */}
      {productJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      )}
      {breadcrumbJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Hidden SEO Content - visible to Google but not to users (ProductClient handles the UI) */}
      {product && (
        <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
          <h1>{product.designation} - SDK Batiment</h1>
          <p>{product.description_courte}</p>
          {product.informations && <p>{product.informations}</p>}
          {product.domaine_application && (
            <div>
              <h2>Domaine d&apos;application de {product.designation}</h2>
              <p>{product.domaine_application}</p>
            </div>
          )}
          {product.avantages && product.avantages.length > 0 && (
            <div>
              <h2>Avantages de {product.designation}</h2>
              <ul>{product.avantages.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}
          {product.mise_en_oeuvre && (
            <div>
              <h2>Mise en œuvre de {product.designation}</h2>
              <p>{product.mise_en_oeuvre}</p>
            </div>
          )}
          {(product.gamme || []).map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </div>
      )}

      <ProductClient />
    </>
  );
}
