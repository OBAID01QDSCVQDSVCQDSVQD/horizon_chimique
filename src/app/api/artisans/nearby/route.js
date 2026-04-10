import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));

        // If no coordinates, we'll still fetch all artisans but won't calculate distance
        const hasLocation = lat && lng;

        // Fetch all artisans
        const artisans = await User.find({ role: 'artisan', status: 'approved' })
            .select('name image specialty companyName lastLocation phone address fidelityRank points')
            .lean();

        // Calculate distance and sort only if location is provided
        const nearbyArtisans = artisans
            .map(artisan => {
                let distance = 99999;
                if (hasLocation && artisan.lastLocation && artisan.lastLocation.lat) {
                    distance = getDistanceFromLatLonInKm(
                        lat, lng,
                        artisan.lastLocation.lat, artisan.lastLocation.lng
                    );
                }
                return { ...artisan, distance: parseFloat(distance.toFixed(1)) };
            })
            // Removed distance < 1000 filter to show ALL artisans globally
            .sort((a, b) => a.distance - b.distance);

        return NextResponse.json({ success: true, artisans: nearbyArtisans });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
