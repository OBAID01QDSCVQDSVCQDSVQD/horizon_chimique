import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
    await dbConnect();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sdkbatiment.com';

    // Static pages
    const staticPages = [
        '',
        '/solutions', // services
        '/about',
        '/contact',
        '/products',
        '/realisations',
        '/gallery'
    ].map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
    }));

    // Dynamic Solutions (Services)
    const solutions = await Solution.find({}, { _id: 1, updatedAt: 1 }).lean();
    const solutionUrls = solutions.map((s) => ({
        url: `${baseUrl}/solutions/${s._id}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Dynamic Products
    const products = await Product.find({}, { _id: 1, updatedAt: 1 }).lean();
    const productUrls = products.map((p) => ({
        url: `${baseUrl}/products/${p._id}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    return [
        ...staticPages,
        ...solutionUrls,
        ...productUrls,
    ];
}
