const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function run() {
    let uri = '';
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('MONGODB_URI')) {
                    const parts = line.split('=');
                    if (parts.length >= 2) {
                        // Join back in case URI has =
                        uri = parts.slice(1).join('=').trim();
                        // Remove quotes
                        if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
                            uri = uri.slice(1, -1);
                        }
                        break;
                    }
                }
            }
        }
    } catch (e) { console.log("Error reading env:", e.message); }

    if (!uri) {
        console.log("Could not find MONGODB_URI in .env.local");
        return;
    }

    console.log("Connecting...");
    try {
        await mongoose.connect(uri);
        console.log("Connected.");

        const collection = mongoose.connection.collection('solutions');
        const docs = await collection.find({}).toArray();

        console.log(`Found ${docs.length} solutions.`);
        docs.forEach(d => {
            console.log(`ID: ${d._id}`);
            console.log(`Title: ${d.title}`);
            console.log(`RelatedProducts Field:`, d.relatedProducts);
            console.log('---');
        });

    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
