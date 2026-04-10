const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({
            logoUrl: String,
            companyName: String
        }, { strict: false }));
        
        const setting = await Setting.findOne();
        console.log("Current DB Settings:", JSON.stringify(setting, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSettings();
