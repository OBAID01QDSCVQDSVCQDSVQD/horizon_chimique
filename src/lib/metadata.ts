import { Metadata } from 'next';

export function buildMetadata(title: string, description: string, slug?: string, image?: string): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sdkbatiment.com';
    const url = slug ? `${baseUrl}${slug.startsWith('/') ? slug : `/${slug}`}` : baseUrl;
    const ogImage = image || '/og-image.jpg';

    return {
        title: `${title} | SDK Batiment`,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${title} | SDK Batiment`,
            description,
            url,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | SDK Batiment`,
            description,
            images: [ogImage],
        },
    };
}
