import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ProductClient from './ProductClient';

export async function generateMetadata({ params: { id } }) {
  try {
    await dbConnect();
    const product = await Product.findOne({ _id: id }).lean();

    if (!product) {
      return {
        title: 'Produit Introuvable',
        description: 'Ce produit n\'existe pas sur SDK Batiment.',
      };
    }

    const title = `${product.designation} | SDK Batiment`;
    const description = product.description_courte || `Découvrez ${product.designation} chez SDK Batiment.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://sdkbatiment.com/products/${id}`,
        // The /products/:id/opengraph-image endpoint handles the dynamic image generation
        images: [
          {
            url: `/products/${id}/opengraph-image`,
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
        images: [`/products/${id}/opengraph-image`],
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

export default function Page() {
  return <ProductClient />;
}
