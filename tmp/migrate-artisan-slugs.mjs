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
const UserSchema = new mongoose.Schema({
    role: String,
    companyName: String,
    name: String,
    specialty: String,
    address: String,
    slug: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function generateSlugs() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not found in .env.local");
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const artisans = await User.find({ role: 'artisan', slug: { $exists: false } });
        console.log(`Found ${artisans.length} artisans without slugs.`);

        for (const artisan of artisans) {
            let baseSlug = artisan.companyName || artisan.name || 'artisan';
            
            if (artisan.specialty) {
                baseSlug += ` ${artisan.specialty}`;
            }
            if (artisan.address) {
                const city = artisan.address.split(',')[0].split('-')[0].trim();
                baseSlug += ` ${city}`;
            }

            let cleanSlug = baseSlug
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            // Check uniqueness in DB (since we are not automatically appending ID)
            let existing = await User.findOne({ slug: cleanSlug, _id: { $ne: artisan._id } });
            if (existing) {
                cleanSlug = `${cleanSlug}-${artisan._id.toString().slice(-4)}`;
            }

            artisan.slug = cleanSlug;
            await artisan.save({ validateBeforeSave: false });
            console.log(`Generated slug: ${cleanSlug}`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

generateSlugs();
