import mongoose from 'mongoose';
import fs from 'fs';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
let MONGODB_URI = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.replace('MONGODB_URI=', '').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
});

// Simplified schema just for updating
const ProductSchema = new mongoose.Schema({
    designation: String,
    slug: String
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function generateSlugs() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not found in .env.local");
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${products.length} products without slugs.`);

        for (const product of products) {
            let baseSlug = product.designation || 'produit';
            
            let slug = baseSlug
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            const shortId = product._id.toString().slice(-4);
            slug = `${slug}-${shortId}`;

            product.slug = slug;
            await product.save({ validateBeforeSave: false });
            console.log(`Generated slug: ${slug}`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

generateSlugs();
