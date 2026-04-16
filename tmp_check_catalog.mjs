import dbConnect from './src/lib/db.js';
import Setting from './src/models/Setting.js';

async function check() {
    try {
        await dbConnect();
        const s = await Setting.findOne({});
        console.log("CATALOG URL:", s?.catalogUrl);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
