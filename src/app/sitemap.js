import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import Product from '@/models/Product';
import Realization from '@/models/Realization';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
    await dbConnect();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sdkbatiment.com';

    // Static pages
    const staticPages = [
        '',
        '/solutions',
        '/about',
        '/contact',
        '/products',
        '/realisations',
        '/gallery',
        '/catalogue',
    ].map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
    }));

    // Dynamic Solutions (Services)
    const solutions = await Solution.find({}, { _id: 1, updatedAt: 1, slug: 1 }).lean();
    const solutionUrls = solutions.map((s) => ({
        url: `${baseUrl}/solutions/${s.slug || s._id}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Dynamic Products
    const products = await Product.find({}, { _id: 1, updatedAt: 1, slug: 1 }).lean();
    const productUrls = products.map((p) => ({
        url: `${baseUrl}/products/${p.slug || p._id}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    // Dynamic Realisations - HIGH PRIORITY for Google traffic
    const realisations = await Realization.find(
        { isVisible: true },
        { _id: 1, updatedAt: 1, slug: 1, video: 1 }
    ).lean();
    const realisationUrls = realisations.map((r) => ({
        url: `${baseUrl}/realisations/${r.slug || r._id}`,
        lastModified: new Date(r.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
    }));

    // Dynamic Artisan Profiles
    const artisans = await User.find(
        { role: 'artisan' },
        { _id: 1, updatedAt: 1, slug: 1 }
    ).lean();
    const artisanUrls = artisans.map((a) => ({
        url: `${baseUrl}/artisans/${a.slug || a._id}`,
        lastModified: new Date(a.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [
        ...staticPages,
        ...solutionUrls,
        ...productUrls,
        ...realisationUrls,
        ...artisanUrls,
    ];
}

