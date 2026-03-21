
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkArtisans() {
    if (!process.env.MONGODB_URI) {
        console.log('No Mongo URI');
        return;
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const count = await mongoose.connection.collection('users').countDocuments({ role: 'artisan' });
    console.log(`Artisans found: ${count}`);

    const artisans = await mongoose.connection.collection('users').find({ role: 'artisan' }).toArray();
    artisans.forEach(a => {
        console.log(`- ${a.name}: ${a.lastLocation ? JSON.stringify(a.lastLocation) : 'NO LOCATION'}`);
    });

    await mongoose.disconnect();
}

checkArtisans();
