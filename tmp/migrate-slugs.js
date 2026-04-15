import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Simplified schema just for updating
const RealizationSchema = new mongoose.Schema({
    title: String,
    location: String,
    slug: String
}, { strict: false });

const Realization = mongoose.models.Realization || mongoose.model('Realization', RealizationSchema);

async function generateSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const projects = await Realization.find({ slug: { $exists: false } });
        console.log(`Found ${projects.length} projects without slugs.`);

        for (const project of projects) {
            let baseSlug = project.title;
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
