import mongoose from 'mongoose';
import fs from 'fs';

// Parse .env.local manually to avoid dotenv dependency issues in standalone scripts
const envFile = fs.readFileSync('.env.local', 'utf8');
let MONGODB_URI = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.replace('MONGODB_URI=', '').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
});

// Simplified schema just for updating
const RealizationSchema = new mongoose.Schema({
    title: String,
    location: String,
    slug: String
}, { strict: false });

const Realization = mongoose.models.Realization || mongoose.model('Realization', RealizationSchema);

async function generateSlugs() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not found in .env.local");
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const projects = await Realization.find({ slug: { $exists: false } });
        console.log(`Found ${projects.length} projects without slugs.`);

        for (const project of projects) {
            let baseSlug = project.title || 'projet';
            if (project.location) {
                baseSlug += ` ${project.location}`;
            }
            
            let slug = baseSlug
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            const shortId = project._id.toString().slice(-4);
            slug = `${slug}-${shortId}`;

            project.slug = slug;
            await project.save({ validateBeforeSave: false });
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
