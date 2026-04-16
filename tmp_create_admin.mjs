import dbConnect from './src/lib/db.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        await dbConnect();
        
        const email = "admin@admin.com";
        const password = "admin123";
        
        let user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (user) {
            console.log("User exists. Updating password...");
            user.password = hashedPassword;
            user.role = 'admin'; // Ensure it is admin
            await user.save();
            console.log("Admin updated successfully!");
        } else {
            console.log("Creating new admin user...");
            await User.create({
                name: "Super Admin",
                email: email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                status: 'approved'
            });
            console.log("Admin created successfully!");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

createAdmin();
