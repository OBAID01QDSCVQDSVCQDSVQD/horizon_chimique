import dbConnect from './src/lib/db.js';
import Setting from './src/models/Setting.js';

async function disableForceUpdate() {
    try {
        await dbConnect();
        const result = await Setting.findOneAndUpdate(
            {},
            { $set: { "mobileApp.forceUpdate": false } },
            { new: true }
        );
        console.log("Force update disabled:", result.mobileApp.forceUpdate);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

disableForceUpdate();
