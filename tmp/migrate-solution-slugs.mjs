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
const SolutionSchema = new mongoose.Schema({
    title: String,
    slug: String
}, { strict: false });

const Solution = mongoose.models.Solution || mongoose.model('Solution', SolutionSchema);

async function generateSlugs() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not found in .env.local");
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const solutions = await Solution.find({ slug: { $exists: false } });
        console.log(`Found ${solutions.length} solutions without slugs.`);

        for (const solution of solutions) {
            let baseSlug = solution.title || 'solution';
            
            let slug = baseSlug
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            const shortId = solution._id.toString().slice(-4);
            slug = `${slug}-${shortId}`;

            solution.slug = slug;
            await solution.save({ validateBeforeSave: false });
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
