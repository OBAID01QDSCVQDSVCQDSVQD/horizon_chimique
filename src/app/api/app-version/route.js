import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export async function GET() {
    try {
        await dbConnect();
        const settings = await Setting.findOne();
        
        if (settings && settings.mobileApp) {
            return NextResponse.json(settings.mobileApp);
        }

        // Fallback in case settings collection is empty
        return NextResponse.json({
            latestVersion: "1.0.1",
            buildNumber: 3,
            downloadUrl: "https://sdkbatiment.com/sdk-batiment-app.apk",
            forceUpdate: true,
            message: "Une mise à jour importante de l'application (v1.0.1) est disponible."
        });
    } catch (error) {
        console.error("Error fetching app version:", error);
        return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 });
    }
}
